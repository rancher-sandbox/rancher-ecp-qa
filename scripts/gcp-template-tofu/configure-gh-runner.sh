#!/bin/bash
set -euxo pipefail

# Variables
GH_USER=gh-runner
GCLOUD_BIN=gcloud
RUNNER_HOME=/home/${GH_USER}
RUNNER_DIR=${RUNNER_HOME}/actions-runner
RUNNER_VERSION="2.333.1"
RUNNER_SHA256="18f8f68ed1892854ff2ab1bab4fcaa2f5abeedc98093b6cb13638991725cab74"
RUNNER_PKG="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
RUNNER_TAR_FILE=runner.tar.gz

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
