#!/bin/bash
set -euxo pipefail

# Variables
GH_USER=gh-runner
GCLOUD_BIN=gcloud
RUNNER_HOME=/home/${GH_USER}
RUNNER_DIR=${RUNNER_HOME}/actions-runner
RUNNER_TAR_FILE=runner.tar.gz

# Set architecture for the runner package based on the system architecture
case "$(uname -m)" in
  x86_64) ARCH=x64 ;;
  aarch64) ARCH=arm64 ;;
  *) echo "$0: unsupported architecture '$(uname -m)' for GitHub Actions runner"; exit 1 ;;
esac


echo "$0: started"

# Add $GH_USER user
mkdir -p ${RUNNER_HOME}
if ! id -u ${GH_USER} >/dev/null 2>&1; then
  useradd -d ${RUNNER_HOME} -g users -G docker,google-sudoers -M ${GH_USER}
  chown -R ${GH_USER}:users ${RUNNER_HOME}
fi

# Wait until hostname is set
until [[ -n "$(hostname)" && ! "$(hostname)" =~ ^localhost ]]; do
  sleep 2
done

HOSTNAME=$(hostname)

# UUID is the suffix after the last '-', stored without dashes (uuidgen | tr -d '-')
UUID=${HOSTNAME##*-}
if [[ ! "${UUID}" =~ ^[0-9a-f]{32}$ ]]; then
  echo "$0: unexpected UUID format: '${UUID}' (expected 32 hex chars, no dashes) stopped"
  exit 1
fi

# Get GH_REPO
GH_REPO=$(${GCLOUD_BIN} secrets versions access latest --secret="GH_REPO_${UUID}")
if [[ -z "${GH_REPO}" ]]; then
  echo "$0: GH_REPO not found! stopped"
  exit 1
fi

# Get PAT token
PAT_TOKEN=$(${GCLOUD_BIN} secrets versions access latest --secret="PAT_TOKEN_${UUID}")
if [[ -z "${PAT_TOKEN}" ]]; then
  echo "$0: PAT_TOKEN not found! stopped"
  exit 1
fi

# Generate registration token
# Keep -X POST and --data-raw "" on the same line with curl to ensure the security scan will detect it as API call
TOKEN=$(curl -fsSL -X POST --data-raw "" \
          -H "Accept: application/vnd.github+json" \
          -H "Authorization: Bearer ${PAT_TOKEN}" \
          https://api.github.com/repos/${GH_REPO}/actions/runners/registration-token \
          | jq -r '.token')

if [[ -z "${TOKEN}" || "${TOKEN}" == "null" ]]; then
  echo "$0: registration token not found! stopped"
  exit 1
fi

# Map secret name directly per architecture
case "${ARCH}" in
  x64)   SECRET_NAME="RUNNER_VERSION_SHA256" ;;
  arm64) SECRET_NAME="RUNNER_VERSION_SHA256_ARM64" ;;
esac

# Try to get runner version and SHA256 from secret, fallback to hardcoded defaults per architecture
if RUNNER_VERSION_SHA256=$(${GCLOUD_BIN} secrets versions access latest --secret="${SECRET_NAME}" 2>/dev/null); then
  RUNNER_VERSION=$(echo "${RUNNER_VERSION_SHA256}" | cut -d: -f1)
  RUNNER_SHA256=$(echo "${RUNNER_VERSION_SHA256}" | cut -d: -f2)
else
  echo "$0: Secret ${SECRET_NAME} not found! Using default values"
  RUNNER_VERSION="2.338.0"
case "${ARCH}" in
    x64)
      RUNNER_SHA256="af4b794c1bc41d73d40535e3fe092a39f9679cd8d965954c2aca25a05ca41d32" # x64
      ;;
    arm64)
      RUNNER_SHA256="475e0c149fd3b611610127b9664ba5bacf5c6928795cc448ab520bb5f324bede" # arm64
      ;;
  esac
fi

if [[ -z "${RUNNER_SHA256}" ]]; then
  echo "$0: SHA256 checksum for architecture '${ARCH}' was not found in secret or fallback"
  exit 1
fi

RUNNER_PKG="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-${ARCH}-${RUNNER_VERSION}.tar.gz"

# Run script to download and configure GitHub runner
sudo -u ${GH_USER} bash -c "
set -euo pipefail
mkdir -p ${RUNNER_DIR}
cd ${RUNNER_DIR}

# Download and verify the runner package
curl -fsSL -o ${RUNNER_TAR_FILE} ${RUNNER_PKG}
echo '${RUNNER_SHA256} ${RUNNER_TAR_FILE}' | sha256sum -c -

tar xzf ${RUNNER_TAR_FILE}
./config.sh \
  --ephemeral \
  --unattended \
  --url https://github.com/${GH_REPO} \
  --token ${TOKEN} \
  --labels ${UUID} \
  --name ${HOSTNAME}

# Install and start runner service as root
sudo ./svc.sh install
sudo ./svc.sh start
"

echo "$0: stopped"
exit 0
