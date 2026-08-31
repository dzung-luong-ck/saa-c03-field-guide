# VPC Foundations

## 1. VPC và CIDR

- VPC là logically isolated network trong một Region.
- Có IPv4 CIDR và optional IPv6 CIDR.
- CIDR không nên overlap với VPC/on-prem networks dự kiến kết nối.
- Subnet thuộc đúng một AZ; VPC trải nhiều AZ.

### CIDR mental math

| CIDR | Tổng IPv4 addresses |
|---|---:|
| `/16` | 65,536 |
| `/20` | 4,096 |
| `/24` | 256 |
| `/28` | 16 |

AWS giữ 5 IPv4 addresses trong mỗi subnet cho network/router/DNS/reserved/broadcast-style reservation. Vì vậy `/28` không cho 16 usable addresses.

## 2. Public và private subnet

### Public subnet

Route table có route tới Internet Gateway:

```text
VPC local CIDR → local
0.0.0.0/0 → Internet Gateway
```

EC2 IPv4 internet trực tiếp còn cần public IPv4/EIP và SG/NACL phù hợp.

### Private subnet

Không có direct route tới IGW. Outbound IPv4 thường:

```text
Private subnet route 0.0.0.0/0
→ NAT Gateway ở public subnet
→ IGW
→ internet
```

### Isolated subnet

Không route internet/NAT; chỉ local/TGW/endpoints/private routes. Phù hợp DB/internal resources.

**Exam rule:** subnet public/private do route table, không do tên hoặc việc EC2 có public IP một mình.

## 3. Route tables

- Mỗi subnet associate một route table.
- Main route table là default cho subnet không associate explicit.
- `local` route cho VPC CIDR.
- Longest prefix match thắng: `/32` cụ thể hơn `/24`, `/24` cụ thể hơn `/0`.
- Blackhole route khi target không tồn tại/attachment down.

### Route target examples

- Internet Gateway.
- NAT Gateway.
- Transit Gateway.
- VPC peering connection.
- Virtual private gateway.
- Gateway endpoint prefix list.
- Network interface/appliance.
- Egress-only IGW.

## 4. Internet Gateway

- Horizontally scaled, redundant managed VPC component.
- Một VPC attach một IGW; một IGW attach một VPC tại một thời điểm.
- Thực hiện public IPv4 translation mapping cho resource public address path.
- Không tự cho inbound; route + public IP + SG/NACL đều phải đúng.

## 5. NAT Gateway

### Public NAT Gateway

- Đặt trong public subnet.
- Gắn Elastic IP.
- Private subnet route tới NAT.
- Cho IPv4 outbound/return traffic, không cho unsolicited inbound.
- Managed, scale/availability trong AZ theo service.

### HA pattern

```text
Private-A → NAT-A in Public-A → IGW
Private-B → NAT-B in Public-B → IGW
```

Tránh một NAT ở AZ-A cho private subnet AZ-B vì:

- AZ-A failure làm AZ-B mất egress;
- cross-AZ data transfer;
- hairpin path.

### Private NAT Gateway

Cho private connectivity/overlapping patterns theo routing design, không dùng để internet qua IGW. Đề associate thường tập trung public NAT.

## 6. NAT Instance

Self-managed EC2 làm NAT:

- disable source/destination check;
- configure routing/IP forwarding;
- SG/NACL;
- patch/scale/HA;
- bandwidth theo instance type.

Chọn khi cần custom appliance behavior, port forwarding/bastion pattern hoặc cost rất nhỏ với chấp nhận ops. NAT Gateway là lựa chọn managed/HA hơn cho production.

## 7. IPv6

- IPv6 addresses globally unique; không cần NAT để giải address scarcity.
- IGW cho inbound/outbound nếu route/security cho phép.
- Egress-only Internet Gateway cho outbound-only IPv6 từ private resources.
- SG/NACL có IPv6 rules riêng; `::/0` là mọi IPv6.
- Dual-stack app cần DNS/ALB/subnet/routes hỗ trợ cả IPv4/IPv6.

## 8. Security Groups

- Stateful virtual firewall ở ENI/resource level.
- Allow rules only.
- Inbound mặc định none khi tạo SG mới; outbound thường allow-all default nhưng có thể sửa.
- Rules aggregate khi resource có nhiều SG.
- Reference SG khác trong supported topology.

### Stateful example

Nếu inbound 443 được allow, response outbound được tự allow bất kể outbound rule direction tương ứng. Đây không có nghĩa mọi new outbound connection được allow.

## 9. Network ACL

- Stateless subnet-level filter.
- Numbered allow/deny rules, evaluate ascending tới first match.
- Default NACL allow all; custom NACL ban đầu deny all.
- Return traffic cần explicit rules.
- Một subnet associate một NACL; một NACL có thể associate nhiều subnets.

### Ephemeral ports

Client kết nối server fixed port, response quay về client ephemeral port. OS ranges khác nhau; NACL phải cho return range đúng.

Ví dụ web client → server 443:

- Web subnet inbound NACL allow 443 from client range.
- Web subnet outbound NACL allow ephemeral destination về client.
- Nếu server gọi DB như client, DB subnet NACL/return ports tương tự.

SG stateful giúp tránh phần lớn manual return rules ở resource layer.

## 10. SG vs NACL decision

| Requirement | Chọn |
|---|---|
| Allow app tier chỉ từ ALB | SG reference |
| Allow DB chỉ từ app SG | SG reference |
| Explicit deny malicious CIDR cho toàn subnet | NACL hoặc WAF/Network Firewall tùy layer |
| Stateful app firewall | SG |
| Defense-in-depth subnet guardrail | NACL |
| SQL injection | WAF, không phải SG/NACL |

## 11. VPC DNS

VPC attributes:

- DNS resolution support.
- DNS hostnames.

Route 53 Resolver cung cấp VPC DNS. Private hosted zones resolve cho associated VPCs. Custom DHCP options có thể đặt DNS/domain/NTP parameters.

### DNS Firewall

Route 53 Resolver DNS Firewall lọc outbound DNS queries theo domain lists/rules. SG không chặn AmazonProvidedDNS theo cách thông thường.

## 12. VPC Flow Logs

- Capture metadata về accepted/rejected traffic ở VPC/subnet/ENI scope.
- Publish tới CloudWatch Logs, S3 hoặc Firehose destinations theo support.
- Fields gồm src/dst IP, ports, protocol, action, bytes/packets và metadata.
- Không capture packet payload.
- Không phải real-time packet capture; delivery latency/aggregation tồn tại.

Use cases:

- NACL/SG troubleshooting.
- top talkers/traffic analysis.
- GuardDuty input/security analytics.
- exfiltration/connection visibility.

## 13. Traffic Mirroring

Copy ENI traffic tới monitoring/security appliance cho packet-level inspection. Khác Flow Logs chỉ metadata.

## 14. VPC design

### Three-tier CIDR example

```text
VPC 10.0.0.0/16
AZ-A:
  public 10.0.0.0/24
  app    10.0.10.0/24
  db     10.0.20.0/24
AZ-B:
  public 10.0.1.0/24
  app    10.0.11.0/24
  db     10.0.21.0/24
```

Để lại address space cho growth; tránh dồn toàn bộ `/16` vào vài subnets khiến khó mở rộng.

## 15. Scenario reasoning

### A. Private EC2 patch từ internet

Private route → NAT Gateway local AZ → IGW. SG outbound/NACL return đúng. Không gắn public IP cho EC2.

### B. Private EC2 chỉ cần S3

S3 gateway endpoint + route table/bucket/endpoint policies; không cần NAT cho path S3.

### C. Chặn một malicious IP toàn subnet

NACL explicit deny nếu network-level CIDR block; WAF IP set nếu HTTP application traffic; chọn đúng layer.

### D. IPv6 private outbound only

Egress-only IGW + `::/0` route; không dùng NAT Gateway như IPv4.

## 16. Exam traps

- Public subnet không làm EC2 public nếu thiếu public IP/security.
- NAT Gateway phải ở public subnet cho internet egress.
- SG stateful; NACL stateless.
- NACL rule number first match; deny thấp hơn allow có thể thắng.
- Flow Logs không chứa payload.
- VPC peering/TGW route không được tạo tự động cho mọi subnet; route/security/DNS vẫn phải cấu hình.
- IPv6 không dùng public NAT như IPv4; egress-only IGW là outbound-only pattern.

Tiếp theo: [Connectivity và Hybrid](02-CONNECTIVITY-HYBRID.md).
