#!/bin/bash
exec 4<$1
while read -u4 m; do
    echo $m
    ssh $m 'sudo systemctl stop nanopay; sudo rm /opt/nanopay/journals/ledger;  sudo systemctl start nanopay'
done
