variable "team" {
  default     = "your-team"
  description = "Team name for resource naming and labels"
  sensitive   = true
}

variable "image" {
  default     = "opensuse-cloud/opensuse-leap"
  description = "GCP image to use for the instance template"
}

variable "project_id" {
  default     = "your-gcp-project"
  description = "GCP project"
  sensitive   = true
}

variable "service_account_email" {
  type        = string
  description = "The email of the existing Service Account to attach to the runners"
  sensitive   = true
}

variable "region" {
  default     = "your-region"
  description = "GCP region"
}

variable "zone" {
  default     = "your-zone"
  description = "GCP zone"
}

variable "vpc" {
  default     = "your-vpc-name"
  description = "GCP VPC name"
  sensitive   = true
}

variable "subnet" {
  default     = "your-subnet-name"
  description = "GCP Subnet name"
  sensitive   = true
}

variable "machine_type" {
  type        = string
  default     = "n2-highmem-16"
  description = "GCP machine type"
}

variable "disk_size_gb" {
  type        = number
  default     = 80
  description = "Boot disk size in GB"
}

variable "spot" {
  type        = bool
  default     = true
  description = "Use SPOT (preemptible) provisioning model. Set to false for STANDARD instances"
}
