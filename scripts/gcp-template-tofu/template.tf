data "google_compute_network" "vpc" {
  name = var.vpc
  project = var.project_id
}

data "google_compute_subnetwork" "subnet" {
  name = var.vpc
  region = var.region
  project = var.project_id
}

data "google_compute_image" "my_image" {
  name    = var.image
  project = var.project_id
}

# Instance template with safe update strategy
resource "google_compute_instance_template" "template" {
  name_prefix  = "${var.team}-ci-${var.spot ? "spot" : "standard"}-"
  machine_type = var.machine_type
  region       = var.region

  scheduling {
    preemptible                 = var.spot
    automatic_restart           = var.spot ? false : true
    on_host_maintenance         = "TERMINATE"
    provisioning_model          = var.spot ? "SPOT" : "STANDARD"
    instance_termination_action = var.spot ? "DELETE" : null

    dynamic "max_run_duration" {
      for_each = var.spot ? [1] : []
      content {
        seconds = 36000 # 10 hours max runtime for spot instances
      }
    }
  }

  disk {
    source_image = data.google_compute_image.my_image.self_link
    auto_delete  = true
    boot         = true
    disk_size_gb = var.disk_size_gb
    disk_type    = "pd-ssd"
  }

  network_interface {
    network = data.google_compute_network.vpc.self_link
    subnetwork = data.google_compute_subnetwork.subnet.self_link
    access_config {
      # Ephemeral IP - leave nat_ip empty
    }
  }
  service_account {
    # Replace with your actual existing SA email
    email  = var.service_account_email

    # "cloud-platform" scope is recommended as it allows the VM
    # to use the IAM permissions assigned to the SA
    scopes = ["cloud-platform"]
  }

  metadata = {
   # enable-oslogin = "TRUE"
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  # Tags are used for referencing firewall rules for a new VPC used by instances, but we use existing VPC with predefined firewall rules, so commenting out for now
  # WARNING: Make sure that your firewall rules are using Target "Apply to all" instances in the VPC
  # tags = ["http-server", "https-server"]

  labels = {
    team = var.team
    os   = "opensuse-leap"
  }
}

output "latest_template_name" {
  value = google_compute_instance_template.template.name
}
