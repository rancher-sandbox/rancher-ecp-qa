# GCP Runner Template Creation

This guide explains how to bake a custom GitHub runner image in GCP (based on the latest `opensuse-leap`) and then deploy a GCP instance template with OpenTofu.

## Prerequisites for Image Baking

- gcloud CLI installed
- gcloud authenticated
- permissions to create and delete GCE instances and images

Authenticate with gcloud:

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project <your-project-id>
```

## OS-Level Customization

For package/service/system customization, edit `bake-startup.sh` before running the `bake-template-image.sh` script.
This script is used as the startup script during image baking and is the correct place for image-level setup.

## Bake the Image

Set `FAMILY` and `ZONE` and run:

```bash
FAMILY=turtles-ci-runners ZONE=asia-south1-c ./bake-template-image.sh
```

On success, the script creates a new image and writes the image name to `image.auto.tfvars`.

## OpenTofu Configuration

Copy the example variables file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set at least:

- project_id
- service_account_email
- region
- zone
- team
- vpc
- subnet

## Deploy the GCP Instance Template (OpenTofu)

After image baking, initialize and apply OpenTofu:

```bash
tofu init
tofu plan
tofu apply
```

The apply output includes `latest_template_name` value (the GCP instance template name).
Use this value in GitHub workflows to launch runner VMs from the correct template.

## Create another template without deleting the old one

By default, OpenTofu ensures that the infrastructure matches the code. If you update the configuration, it will attempt to replace the existing template. To prevent this and keep the old template active in GCP while creating a new one, follow these steps:

### 1. Resource protection
This repository already sets `prevent_destroy = true` on `google_compute_instance_template.template` in [template.tf](template.tf), so no extra action is needed here. Keep this safeguard in place to avoid accidental deletion during `tofu apply`.

```hcl
lifecycle {
  prevent_destroy = true
}
```

### 2. Untrack the Existing Resource
To "detach" the current template from OpenTofu's management without deleting it from Google Cloud, use the `state rm` command. This tells OpenTofu to "forget" the resource while leaving it alive in GCP:

```bash
tofu state rm google_compute_instance_template.template
```

### 3. Apply the New Configuration
Once the state is cleared, OpenTofu no longer "sees" the old template in its inventory. When you run `apply` again, it will treat the configuration as a brand-new resource and generate a new version:

```bash
tofu apply
```

The previous template remains in GCP as an "unmanaged" resource, allowing existing runners or workflows to continue using it until you manually delete it via the GCP Console or CLI.

## Cleanup

To remove resources that are **still tracked** in the OpenTofu state file:

1. **Disable Protection:** Open `template.tf` file and comment out or set `prevent_destroy = false` in the `lifecycle` block.
2. **Run Destroy:**

```bash
tofu destroy
```

> [!IMPORTANT]
> **Manual Cleanup Required:** The `tofu destroy` command only affects resources currently managed by the state file.
> Any templates previously removed via `tofu state rm` or baked images stored in GCP must be deleted manually
> in the GCP Console when they are no longer needed.

## Required Secrets for using the GCP Instance Template

The runner bootstrap script reads these Google Secret Manager secrets:

- `GH_REPO_<uuid>`
- `PAT_TOKEN_<uuid>`
- `RUNNER_VERSION_SHA256` (optional, set to override the default runner version and SHA256)

`<uuid>` is the hostname suffix and must be 32 lowercase hex characters without dashes.

Example values:

- `GH_REPO_<uuid>`: owner/repo
- `PAT_TOKEN_<uuid>`: GitHub PAT with permission to request runner registration token
- `RUNNER_VERSION_SHA256`: runner version and SHA256 in format "VERSION:SHA256" (optional)

Create or update secrets with gcloud (normally handled by the `create-runner` job in the main workflow):

```bash
echo -n 'owner/repo' | gcloud secrets create GH_REPO_<uuid> --ttl="36000s" --quiet --data-file=-
echo -n '<github-pat>' | gcloud secrets create PAT_TOKEN_<uuid> --ttl="36000s" --quiet --data-file=-
echo -n '2.335.1:4ef2f25285f0ae4477f1fe1e346db76d2f3ebf03824e2ddd1973a2819bf6c8cf' | gcloud secrets create RUNNER_VERSION_SHA256 --data-file=-
```
