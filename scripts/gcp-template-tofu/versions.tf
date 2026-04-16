terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.25.0" # Always pin your version for stability
    }
  }
}

provider "google" {
  project = "${var.project_id}"
  region  = "${var.region}"
  zone    = "${var.zone}"
}
