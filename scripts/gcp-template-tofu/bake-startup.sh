#!/bin/bash
set -e

# Install dependencies
if true; then
  zypper addrepo -f https://packages.cloud.google.com/yum/repos/cloud-sdk-el8-x86_64 google-cloud-sdk
  zypper addrepo -f https://cli.github.com/packages/rpm/gh-cli.repo
  zypper --gpg-auto-import-keys refresh
  zypper --non-interactive update
  zypper --non-interactive install -t pattern devel_basis
  zypper --non-interactive install docker docker-buildx vim vim-data bash-completion wget curl iptables npm jq yq git go yarn
  zypper --non-interactive install google-cloud-cli gh
  systemctl enable docker
fi

# Disable selinux
rm /etc/selinux/config
if [ -f /etc/default/grub ]; then
  sed -i "s/security=selinux selinux=1/selinux=0/g" /etc/default/grub
fi
update-bootloader

# Increase inotify limits for file watching
{
  echo "fs.inotify.max_user_watches=524288"
  echo "fs.inotify.max_user_instances=8192"
  echo "fs.inotify.max_queued_events=262144"
} >> /etc/sysctl.conf
dracut -f


# Write configure-gh-runner service files stored in instance metadata
METADATA="http://metadata.google.internal/computeMetadata/v1/instance/attributes"

curl -fsSL -X GET --data-raw "" -H "Metadata-Flavor: Google" \
  "${METADATA}/configure-gh-runner-script" \
  > /opt/configure-gh-runner.sh
chmod 755 /opt/configure-gh-runner.sh

curl -fsSL -X GET --data-raw "" -H "Metadata-Flavor: Google" \
  "${METADATA}/configure-gh-runner-service" \
  > /etc/systemd/system/configure-gh-runner.service

systemctl enable configure-gh-runner.service

# Cleanup
# This is late enough to delete users created by GCP
cd /home; for i in $(ls); do userdel -rf $i; done
zypper clean -a
sync

# Turn off the bake VM when done
echo "BAKING_COMPLETE"
sleep 5 # Sleep for a few seconds to ensure the message is logged before shutdown
shutdown -h now
