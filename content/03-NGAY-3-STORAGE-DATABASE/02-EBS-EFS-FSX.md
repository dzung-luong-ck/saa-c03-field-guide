# EBS, Instance Store, EFS và FSx

## 1. Object vs block vs file

| Kiểu | Interface | Service | Khi chọn |
|---|---|---|---|
| Object | HTTP/API | S3 | Data lake, media, backup, static assets |
| Block | Disk/device | EBS, instance store | Boot, DB files, low-latency random I/O |
| File | NFS/SMB/Lustre | EFS, FSx | Shared hierarchy và filesystem semantics |

## 2. EBS fundamentals

- Network-attached block storage cho EC2.
- Volume thuộc một AZ; attach instance trong cùng AZ.
- Persist độc lập instance nếu DeleteOnTermination không xóa.
- Provision size/performance; trả phí provisioned resources theo volume type.
- Có thể detach/attach, resize/change type theo service support.

### Move across AZ/Region

```text
EBS volume AZ-A
→ snapshot
→ create volume AZ-B
```

Cross-Region: copy snapshot sang Region đích trước khi tạo volume.

## 3. EBS volume types

| Type | Media | Tối ưu | Chọn khi |
|---|---|---|---|
| `gp3` | SSD | General purpose, independent IOPS/throughput | Boot/app/most general workloads |
| `gp2` | SSD | Legacy general purpose, performance tied to size | Existing workloads; thường migrate gp3 |
| `io2 Block Express` | SSD | Highest IOPS/durability/low latency | Mission-critical I/O-intensive DB |
| `io1` | SSD | Legacy Provisioned IOPS | Existing compatibility |
| `st1` | HDD | Large sequential throughput | Big data, logs, warehouse |
| `sc1` | HDD | Lowest-cost cold sequential storage | Infrequent large sequential access |

- HDD types không làm boot volumes.
- SSD chọn theo IOPS/latency; HDD theo throughput/sequential pattern.
- `gp3` current limits đã cao hơn con số cũ trong slide; xem [EBS volume types](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html) nếu câu hỏi có số cụ thể.

## 4. IOPS, throughput và latency

```text
Throughput ≈ IOPS × average I/O size
```

Tối ưu sai metric gây lãng phí:

- DB random 16 KiB: cần IOPS/latency.
- Sequential log/warehouse 1 MiB: cần throughput.
- Instance cũng phải có EBS bandwidth đủ; volume provision cao nhưng instance bottleneck vẫn chậm.
- Queue length/latency/burst balance metrics giúp chẩn đoán.

## 5. Snapshots

- Point-in-time block snapshot, incremental sau snapshot đầu.
- Lưu service-managed trong S3 infrastructure, không thấy như normal S3 object.
- Có thể copy Region/account với encryption/sharing constraints.
- Create volume từ snapshot có lazy initialization; first-read latency có thể xảy ra.
- Fast Snapshot Restore/pre-warm khi cần full performance ngay, có cost.
- Snapshot Archive giảm cost, restore chậm.
- Recycle Bin policies bảo vệ accidental deletion.

### Application consistency

Snapshot khi volume đang dùng có thể crash-consistent nhưng app/DB buffers chưa flush. Để application-consistent:

- quiesce/freeze filesystem;
- flush database;
- use database-aware backup;
- coordinate multi-volume snapshot.

## 6. EBS Multi-Attach

- Chỉ supported Provisioned IOPS scenarios/instances.
- Instances cùng AZ.
- Mỗi instance có read/write; application phải coordinate concurrent writes.
- Cần cluster-aware filesystem/application.
- Không thay EFS/FSx cho generic shared files.

## 7. Instance Store

- Physical/local NVMe storage gắn host.
- Very high I/O, low latency.
- Ephemeral: data mất khi instance lifecycle/host event làm store mất.
- Không thể detach như EBS.

Use cases:

- cache;
- scratch/temp;
- replicated shard data;
- buffers;
- HPC intermediate data.

Application chịu trách nhiệm replication/backup. Không đặt unique durable data chỉ ở instance store.

## 8. RAID reasoning

- RAID 0: stripe nhiều EBS volumes để tăng performance/capacity; không redundancy, một volume lỗi ảnh hưởng array.
- RAID 1: mirror cho redundancy ở OS layer; cost gấp đôi và không thay AZ-level HA.
- EBS service đã replication trong AZ theo design; RAID chọn vì app/performance requirement, không mặc định.

## 9. EFS fundamentals

- Managed elastic NFS filesystem.
- Multiple Linux/NFS clients concurrent.
- Mount targets trong VPC/AZs; SG bảo vệ NFS access.
- Capacity tự grow/shrink, pay for storage used.
- Standard deployment multi-AZ; One Zone deployment rẻ hơn và một AZ.
- Integrates EC2, ECS, EKS, Lambda và on-prem connectivity theo support.

### EFS storage classes/lifecycle

- Standard/Frequent access.
- Infrequent Access.
- Archive tier theo current feature set.
- Lifecycle policies chuyển file theo last access/criteria.
- One Zone/One Zone-IA cho data chấp nhận AZ loss hoặc có backup.

### EFS performance/throughput modes

- General Purpose cho latency-sensitive common workloads.
- Max I/O là legacy/high-parallel trade-off trong supported contexts; kiểm tra current recommendations.
- Bursting/provisioned/elastic throughput theo workload.
- Elastic throughput phù hợp unpredictable throughput; provisioned khi cần throughput độc lập storage size.

### EFS Access Points

- Application-specific root directory/POSIX identity.
- Kết hợp IAM authorization và mount helper/TLS.
- Tách multi-tenant access trên shared filesystem.

## 10. FSx portfolio

| FSx | Protocol/features | Use case |
|---|---|---|
| Windows File Server | SMB, Windows ACL, AD, DFS-related enterprise integration | Windows lift-and-shift, home dirs, SQL/app shares |
| Lustre | High-performance parallel POSIX, S3 link | HPC, ML, media, financial simulations |
| NetApp ONTAP | NFS/SMB/iSCSI, snapshots, clones, tiering | NetApp migration, multi-protocol enterprise storage |
| OpenZFS | NFS, ZFS snapshots/clones | ZFS/Linux workloads, low-latency file storage |

### FSx for Windows

- Native Windows filesystem/SMB.
- Microsoft AD authentication và Windows ACLs.
- Single-AZ/Multi-AZ deployment options theo requirement.
- On-prem access qua VPN/DX.
- Chọn thay EFS khi workload cần SMB/Windows semantics.

### FSx for Lustre

- Parallel high-throughput/low-latency filesystem.
- Link S3 data repository: S3 objects xuất hiện như files, import/export data.
- Scratch/persistent deployment options theo durability/performance use case.
- Chọn khi hàng trăm/thousands compute nodes cần process shared S3 dataset nhanh.

### FSx for NetApp ONTAP

- Multi-protocol và NetApp ecosystem.
- Storage virtual machines/volumes, dedup/compression/tiering/snapshots/clones.
- Hybrid migration/DR bằng NetApp tools.

### FSx for OpenZFS

- NFS v3/v4 family.
- ZFS datasets/volumes, snapshots/clones/compression.
- Migration từ on-prem ZFS/Linux file servers.

## 11. Storage selection scenarios

### A. Database boot volume, general workload

`gp3`; tune IOPS/throughput độc lập. Không chọn `st1` làm boot.

### B. Mission-critical DB yêu cầu sustained IOPS/sub-ms

`io2 Block Express` + EBS-optimized/Nitro-compatible instance; verify instance bandwidth.

### C. Big sequential logs

`st1` nếu cần frequently accessed throughput; `sc1` nếu cold/infrequent. Không chọn HDD cho random transactional DB.

### D. WordPress fleet nhiều AZ cần shared uploads

EFS Standard. Hoặc tốt hơn S3 nếu app/object access cho phép; đề nói shared POSIX/NFS thì EFS.

### E. Windows app cần SMB và AD

FSx for Windows File Server.

### F. ML training đọc TB data S3 bằng parallel filesystem

FSx for Lustre linked to S3.

## 12. Exam traps

- EBS volume theo AZ; snapshot giúp move.
- EFS Standard multi-AZ nhưng mount targets/network vẫn phải cấu hình nhiều AZ.
- Instance store rất nhanh nhưng ephemeral.
- Multi-Attach không biến EBS thành generic NFS.
- FSx Windows dùng SMB/AD; EFS dùng NFS/Linux semantics.
- FSx Lustre là processing filesystem; S3 vẫn là durable data repository pattern.
- `gp3` thường cost/performance tốt hơn legacy `gp2`, nhưng không tự giải mọi I/O bottleneck.

Tiếp theo: [Databases](03-DATABASES.md).
