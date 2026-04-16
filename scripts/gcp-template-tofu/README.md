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
tofu apply
```

The apply output includes `latest_template_name` value (the GCP instance template name).
Use this value in GitHub workflows to launch runner VMs from the correct template.

## Cleanup

If the instance template become outdated you may remove OpenTofu-managed resources by:

```bash
tofu destroy
```

> [!NOTE]
Delete the baked image manually in GCP when it's no longer referenced by any template.

## Required Secrets for using the GCP Instance Template

The runner bootstrap script reads these Google Secret Manager secrets:

- `GH_REPO_<uuid>`
- `PAT_TOKEN_<uuid>`

`<uuid>` is the hostname suffix and must be 32 lowercase hex characters without dashes.

Example values:

- `GH_REPO_<uuid>`: owner/repo
- `PAT_TOKEN_<uuid>`: GitHub PAT with permission to request runner registration token

Create or update secrets with gcloud (normally handled by the `create-runner` job in the main workflow):

```bash
echo -n 'owner/repo' | gcloud secrets create GH_REPO_<uuid> --ttl="36000s" --quiet --data-file=-
echo -n '<github-pat>' | gcloud secrets create PAT_TOKEN_<uuid> --ttl="36000s" --quiet --data-file=-
```
