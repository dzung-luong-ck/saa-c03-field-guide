# Migration và data transfer

## 1. Bắt đầu bằng yêu cầu

Trước khi chọn dịch vụ, xác định:

- Nguồn là server, database, file system, object hay application protocol?
- Online hay offline? Băng thông và thời gian migration window?
- Có cần continuous replication/CDC và cutover downtime thấp không?
- Dữ liệu bao nhiêu TB/PB, có hàng triệu file nhỏ không?
- Target là S3, EFS, FSx, EC2, RDS/Aurora hay data center khác?
- Có yêu cầu encryption, checksum/validation, private connectivity, RPO/RTO?

## 2. 7 chiến lược migration

| Strategy | Ý nghĩa | Ví dụ |
|---|---|---|
| Retire | Bỏ ứng dụng không cần | tắt legacy duplicate |
| Retain | Giữ lại hiện trạng | chưa sẵn sàng/compliance |
| Rehost | Lift-and-shift | server → EC2 bằng MGN |
| Relocate | Di chuyển nguyên platform | VMware environment theo dịch vụ phù hợp |
| Repurchase | Đổi sang SaaS/sản phẩm khác | CRM on-prem → SaaS |
| Replatform | Thay nền tảng, ít sửa code | self-managed DB → RDS |
| Refactor/Re-architect | Sửa đáng kể để cloud-native | monolith → services/serverless |

Trong đề, “minimal changes” thường là rehost/replatform; “maximize cloud benefit” có thể là refactor nhưng tốn thời gian/rủi ro hơn.

## 3. Application Migration Service (MGN)

- Lift-and-shift physical/virtual/cloud servers sang AWS.
- Agent/block-level replication liên tục vào staging area, sau đó launch test/cutover EC2.
- Hợp khi muốn minimal downtime và ít sửa ứng dụng.
- Không phải công cụ logical database schema conversion; database-specific migration dùng DMS/SCT.
- Luôn test boot, network, IAM, DNS, performance và rollback trước cutover.

## 4. Database Migration Service (DMS)

- Replication instance/serverless mode đọc source và ghi target.
- **Full load** sao chép dữ liệu hiện có; **CDC** tiếp tục áp dụng thay đổi để giảm downtime.
- Homogeneous: cùng engine; heterogeneous: khác engine, cần schema conversion.
- AWS Schema Conversion Tool/DMS Schema Conversion chuyển schema/code object theo phạm vi hỗ trợ; phần không tự chuyển phải sửa thủ công.
- Target có thể là RDS/Aurora/Redshift/S3 và nguồn/target được hỗ trợ khác.

### Migration pattern

1. Assessment và schema conversion.
2. Full load.
3. CDC trong lúc application vẫn chạy source.
4. Validate row/data/application.
5. Quiesce writes, chờ replication lag gần 0.
6. Cutover app/DNS/connection.
7. Monitor, giữ rollback window theo plan.

DMS không tự thay application SQL incompatibility, stored procedure logic hay performance tuning.

## 5. DataSync

- Online accelerated transfer giữa on-prem/other cloud và AWS storage, hoặc giữa AWS storage locations được hỗ trợ.
- Target/source thường gồm S3, EFS, FSx và NFS/SMB/HDFS/object storage theo hỗ trợ.
- Agent gần on-prem source cho nhiều kịch bản; schedule, encryption in transit, integrity verification và metadata handling.
- Hợp bulk + incremental file/object transfer định kỳ, không phải block-level server migration.

### DataSync vs Storage Gateway

- DataSync: **di chuyển/đồng bộ** dữ liệu theo job.
- Storage Gateway: **truy cập hybrid liên tục** qua protocol file/volume/tape với AWS-backed storage.

## 6. AWS Snow Family

- Thiết bị vật lý cho offline/edge data transfer khi network quá chậm, hạn chế hoặc site disconnected.
- Snowball Edge có storage và edge compute tùy loại; nhiều thiết bị/job cho dữ liệu lớn.
- Snowcone nhỏ/portable, có thể dùng DataSync online theo cấu hình.
- Snowmobile từng phục vụ exabyte-scale theo tài liệu lịch sử; với triển khai thực, kiểm tra trạng thái cung cấp hiện hành.

### Ước lượng nhanh

`Thời gian giây ≈ dữ liệu bit / throughput bit/s`, sau đó cộng overhead, contention, encryption và retry. Nếu online không kịp migration window, cân nhắc Snow + parallel upload/Direct Connect.

## 7. Storage Gateway

| Gateway | Interface/use case |
|---|---|
| S3 File Gateway | NFS/SMB local, object lưu S3; cache local |
| FSx File Gateway | SMB access/cache tới FSx for Windows File Server |
| Volume Gateway | iSCSI block volume, cached/stored modes theo loại |
| Tape Gateway | Virtual Tape Library cho backup app, archive AWS |

Gateway phù hợp hybrid steady-state, backup/restore, local cache. Nó không thay Direct Connect và không phải database replication service.

## 8. AWS Transfer Family

- Managed SFTP, FTPS, FTP và AS2 endpoints tới S3/EFS theo tính năng hỗ trợ.
- Chọn khi partner/app legacy bắt buộc file-transfer protocol và không muốn quản server.
- Không dùng để mount filesystem như NFS/SMB; đó là EFS/FSx/Storage Gateway.

## 9. Network transfer options

### Site-to-Site VPN

- Nhanh triển khai, encrypted qua Internet, throughput/latency phụ thuộc đường Internet.
- Hợp bootstrap hoặc backup cho Direct Connect.

### Direct Connect

- Dedicated private connectivity từ location tới AWS; predictable hơn Internet.
- Không encrypted mặc định ở layer truyền dẫn; dùng MACsec ở phạm vi hỗ trợ hoặc VPN over DX/application encryption khi cần.
- Provision có thể mất thời gian; VPN dùng trong lúc chờ.
- Direct Connect Gateway kết nối virtual interfaces với VPC/VGW/TGW theo phạm vi hỗ trợ, không phải router transitive tùy ý.

### S3 Transfer Acceleration

- Client upload/download S3 qua edge và AWS backbone, hữu ích khoảng cách xa.
- Vẫn là online Internet-facing transfer, có phí; test speed/cost trước.

## 10. Migration/modernization services nhận diện

- **Migration Hub**: theo dõi/điều phối visibility migration từ nhiều tool.
- **Application Discovery Service**: thu thập inventory/dependency/performance on-prem để plan.
- **Migration Evaluator**: business case/TCO discovery.
- **Elastic Disaster Recovery**: block replication và recovery cho DR; khác MGN ở mục tiêu vận hành nhưng có nền tảng tương tự.
- **Mainframe Modernization**: migrate/modernize mainframe theo tooling managed.

## 11. Decision matrix

| Tình huống | Chọn chính |
|---|---|
| 200 VMware/physical servers, minimal code change | MGN |
| Oracle → Aurora PostgreSQL, downtime thấp | SCT/schema conversion + DMS full load + CDC |
| 500 TB file, đường mạng không kịp | Snow Family |
| NFS on-prem đồng bộ hàng đêm vào S3 | DataSync |
| User on-prem cần SMB low-latency với cache, data AWS-backed | Storage Gateway |
| Partner gửi SFTP vào S3 | Transfer Family |
| Kết nối hybrid ổn định lâu dài | Direct Connect, thường VPN backup |
| Upload S3 toàn cầu qua Internet nhanh hơn | S3 Transfer Acceleration |

## 12. Cutover checklist

- Inventory dependency, port, DNS, certificate và allowlist.
- Baseline performance và success criteria.
- Test migration trong isolated environment.
- Validate data count/checksum/application behavior.
- Hạ DNS TTL trước cutover đủ sớm nếu dùng DNS switch.
- Freeze/quiesce writes theo runbook; kiểm tra lag.
- Observability và alarm sẵn sàng ở target.
- Rollback trigger, owner và deadline rõ ràng.
- Không decommission source trước khi qua validation/retention window.

## 13. Bẫy đề thi

- DMS chuyển data; schema conversion xử lý engine differences.
- DataSync không phải continuous block replication cho bootable server.
- Direct Connect không tự mã hóa data.
- Snow device không mang Internet bandwidth tới site; nó là offline transfer/edge compute.
- S3 Transfer Acceleration không phù hợp nếu client ở gần Region và không cải thiện đáng kể.
- Storage Gateway là hybrid access, không phải one-time bulk migration tool tối ưu nhất.
- Read replica cross-Region có thể hỗ trợ DB migration/DR nhưng phụ thuộc engine và không thay migration plan đầy đủ.

## 14. Tự kiểm tra

1. Rehost Linux/Windows server hàng loạt? → MGN.
2. Chuyển database khác engine? → schema conversion + DMS.
3. CDC để làm gì? → đồng bộ change sau full load, giảm downtime.
4. 1 PB không đủ băng thông? → Snow Family.
5. SFTP managed vào S3? → Transfer Family.
6. NFS file sync online lặp lại? → DataSync.
7. Virtual tapes lên AWS? → Tape Gateway.
8. Private predictable link lâu dài? → Direct Connect.
9. DX cần encryption? → MACsec/VPN/application TLS tùy thiết kế.
10. Central migration tracking? → Migration Hub.

## Nguồn AWS

- [AWS Migration and Transfer](https://aws.amazon.com/cloud-migration/)
- [AWS DMS](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [AWS DataSync](https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html)
- [AWS Snow Family](https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html)
