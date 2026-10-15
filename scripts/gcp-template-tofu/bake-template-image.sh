#!/bin/bash
set -e

# Variables
# Set values in one of two ways:
# 1) Inline defaults below
# 2) Shell env vars, e.g. FAMILY=turtles-ci-runners ZONE=asia-south1-c ARCH=x86_64 ./bake-template-image.sh
FAMILY="${FAMILY:-}"
ZONE="${ZONE:-}"
ARCH="${ARCH:-x86_64}" # Architecture for the VM and image (e.g., x86_64, arm64)

if [[ -z "${FAMILY}" || -z "${ZONE}" ]]; then
  echo "$0: required variables FAMILY / ZONE are missing"
  exit 1
fi

if ! command -v gcloud >/dev/null 2>&1; then
  echo "$0: gcloud CLI not found in PATH"
  exit 1
fi

ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null || true)
if [[ -z "${ACTIVE_ACCOUNT}" ]]; then
  echo "$0: no active gcloud account found. Run: gcloud auth login"
  exit 1
fi

case "${ARCH}" in
  aarch64|arm64)
    ARCH="aarch64"
    MACHINE_TYPE="${MACHINE_TYPE:-t2a-standard-4}"
    ARCH_VALUE="ARM64"
    ARCH_FAMILY_SUFFIX="-arm64"
    ;;
  x86_64|amd64)
    ARCH="amd64" # GCP instance name can't contain underscores
    MACHINE_TYPE="${MACHINE_TYPE:-n2-standard-4}"
    ARCH_VALUE="X86_64"
    ARCH_FAMILY_SUFFIX=""
    ;;
  *)
    echo "$0: Unsupported architecture '${ARCH}'. Use 'x86_64' or 'aarch64'."
    exit 1
    ;;
esac

# Generate a unique image name using the family and current date/time
IMAGE_NAME="${FAMILY}-${ARCH}-up$(date +%Y%m%d-%H%M)"
INSTANCE="${IMAGE_NAME}-tmp"

echo "Building image for architecture: ${ARCH} (Machine type: ${MACHINE_TYPE})"

# Create a VM to cook the image - architecture seems to be driven by the machine type rather than an explicit architecture flag
gcloud compute instances create $INSTANCE \
    --zone=$ZONE --machine-type=$MACHINE_TYPE \
    --image-family=opensuse-leap${ARCH_FAMILY_SUFFIX} --image-project=opensuse-cloud \
    --metadata-from-file=startup-script=bake-startup.sh,configure-gh-runner-script=configure-gh-runner.sh,configure-gh-runner-service=configure-gh-runner.service

# Block and show logs while provisioning VM,
# and use stdbuf line buffering to ensure logs are printed in real time, and tee to save logs to a file for later verification
echo "Block until the build is complete and the VM is off"
stdbuf -oL gcloud compute instances tail-serial-port-output "$INSTANCE" --zone="$ZONE" 2> /dev/null | tee baking-$IMAGE_NAME.log || true

# Verify that the bake completed successfully by checking the logs for the "BAKING_COMPLETE" message
grep -q "BAKING_COMPLETE" baking-$IMAGE_NAME.log || { echo "Bake failed - check baking-$IMAGE_NAME.log for details"; exit 1; }

# Capture the image once the VM is in TERMINATED state, then create the image and clean up the instance
echo "Waiting for instance to power off..."
until [ "$(gcloud compute instances describe $INSTANCE --zone=$ZONE --format='value(status)')" == "TERMINATED" ]; do
  sleep 5
done

gcloud compute images create $IMAGE_NAME \
    --source-disk=$INSTANCE --source-disk-zone=$ZONE \
    --family=$FAMILY \
    --architecture=$ARCH_VALUE

gcloud compute instances delete $INSTANCE --zone=$ZONE --quiet

#  Set the created image in image.auto.tfvars for use in tofu apply
echo "image = \"${IMAGE_NAME}\"" > image.auto.tfvars

# Report the created image and how to use it
echo "-------------------------------------------------"
echo "Image Created: ${IMAGE_NAME} (${ARCH})"
echo "The file 'image.auto.tfvars' has been updated."
echo "You can now run 'tofu apply'."
echo
