# VPC Connectivity và Hybrid Networking

## 1. Chọn connectivity theo scope

| Need | Service |
|---|---|
| Hai VPC full IP connectivity | VPC Peering |
| Nhiều VPC/on-prem transitive hub | Transit Gateway |
| Consume một private service | PrivateLink/interface endpoint |
| Share supported resource/subnet | AWS RAM |
| S3/DynamoDB private từ VPC | Gateway endpoint |
| AWS service private ENI | Interface endpoint |
| Encrypted hybrid nhanh triển khai | Site-to-Site VPN |
| Dedicated predictable hybrid link | Direct Connect |
| Individual remote users | Client VPN |

## 2. VPC Peering

- One-to-one connection giữa VPCs.
- Same/cross-account, same/cross-Region theo support.
- Non-transitive.
- CIDRs không overlap.
- Update route tables hai phía.
- SG reference support phụ thuộc same/cross-Region/account constraints hiện hành.

```text
A ↔ B, B ↔ C
A không tự đi tới C qua B
```

Chọn cho ít VPC, simple connectivity, không cần central hub/policy.

## 3. Transit Gateway

- Regional network transit hub.
- Attach VPC, VPN, Direct Connect gateway và peering TGWs theo architecture.
- Transitive routing.
- TGW route tables tạo segmentation: prod/nonprod/shared services/on-prem.
- Simplify mesh complexity, nhưng có attachment/data processing cost.

### Segmentation example

```text
Prod VPCs → TGW-prod route table → shared inspection/on-prem
Dev VPCs  → TGW-dev route table  → shared services, không vào prod
```

Không advertise/propagate mọi attachment vào mọi table nếu isolation requirement.

## 4. AWS PrivateLink

```text
Consumer VPC
Interface Endpoint (ENI/private IP)
→ PrivateLink
→ Endpoint Service/NLB in Provider VPC
```

- Expose service privately, không full network connectivity.
- Consumer không cần route tới provider CIDR.
- Scales cross-account customers/SaaS.
- Overlapping CIDRs ít vấn đề hơn peering vì service-centric.
- Provider thường dùng NLB/GWLB endpoint service model.

Chọn khi nhiều consumer VPCs chỉ cần một service, không cần full mesh.

## 5. Gateway endpoint

- Hỗ trợ S3 và DynamoDB.
- Route-table target dùng AWS-managed prefix list.
- Không ENI/SG.
- Không endpoint hourly/data processing charge.
- Regional; VPC route tables được associate.
- Gateway endpoint policy thêm access control.

### Limitation quan trọng

- Không truy cập trực tiếp từ on-prem qua VPN/DX như interface private IP endpoint.
- Không transit qua TGW/peering theo classic gateway behavior.
- Dùng interface endpoint cho S3/DynamoDB nếu on-prem/private IP/cross-VPC scenario cần.

## 6. Interface endpoint

- AWS PrivateLink.
- ENI/private IP trong selected subnets/AZs.
- Security Group bảo vệ endpoint ENI.
- Private DNS để standard service hostname resolve tới endpoint.
- Hourly + data processing cost.
- Hỗ trợ nhiều AWS services và endpoint services.

### HA

Tạo endpoint ENIs ở nhiều AZ/subnets mà clients chạy để giảm cross-AZ path và chịu AZ failure.

## 7. Endpoint policy, resource policy, IAM

Private path không tự cấp quyền.

```text
IAM principal policy
∩ VPC endpoint policy
∩ S3 bucket/KMS/resource policy
∩ SCP/boundary
```

Endpoint policy là guardrail cho traffic qua endpoint; không thay identity/resource authorization.

## 8. AWS RAM và VPC sharing

- Resource owner account share subnets và supported resources cho participant accounts.
- Participant launch resources vào shared subnet nhưng không sở hữu network components.
- Central network team quản VPC/routes/NACL; app teams quản resources/SG theo permission.
- Giảm số VPC/connectivity, nhưng tăng shared blast radius/governance need.

## 9. Site-to-Site VPN

Components:

- Customer Gateway: on-prem device/logical representation.
- Virtual Private Gateway hoặc Transit Gateway ở AWS.
- Hai IPsec tunnels cho HA.
- Static routes hoặc BGP dynamic routing.

Ưu điểm:

- Nhanh triển khai.
- Encryption in transit qua internet.
- Làm backup cho DX.

Trade-off:

- Internet variability.
- Throughput/tunnel limits.
- On-prem device/BGP configuration.

## 10. Direct Connect

- Dedicated private physical connectivity từ location tới AWS.
- Predictable bandwidth/latency hơn internet VPN.
- Lead time dài hơn; không phải instant.
- Không mặc định encrypted end-to-end; dùng MACsec nơi hỗ trợ hoặc VPN over DX nếu cần encryption.

### Virtual interfaces

| VIF | Access |
|---|---|
| Private VIF | Private resources/VPC via VGW/DX Gateway patterns |
| Public VIF | AWS public service endpoints using public prefixes |
| Transit VIF | Transit Gateway through Direct Connect Gateway |

### Direct Connect Gateway

- Kết nối DX tới multiple VPCs/Regions qua VGW/TGW associations theo design.
- Không phải packet inspection service.
- Route advertisements/BGP communities cần thiết kế.

### HA patterns

- Hai DX connections ở distinct locations/devices.
- DX primary + Site-to-Site VPN backup.
- BFD/BGP route priority/failover testing.

Một DX connection duy nhất không phải HA.

## 11. Client VPN

- Managed OpenVPN-based remote access cho users.
- Authentication certificate/AD/federated options theo support.
- Authorization rules và target network associations.
- Dùng cho employees, không Site-to-Site network-to-network.

## 12. Hybrid DNS

### Route 53 Resolver inbound endpoint

On-prem DNS gửi query vào VPC để resolve private hosted zones/AWS names.

### Outbound endpoint

VPC Resolver forward selected domains tới on-prem DNS.

### Rules

- Conditional forwarding theo domain.
- Share Resolver rules qua RAM.
- Deploy endpoints nhiều AZ.

```text
onprem.example.com → outbound endpoint → on-prem DNS
aws.internal       ← inbound endpoint  ← on-prem clients
```

## 13. Cloud WAN

Managed global WAN core cho multi-Region/multi-site networks và centralized policy. Transit Gateway phù hợp Regional hub; Cloud WAN khi đề nhấn mạnh global enterprise WAN policy/automation.

## 14. Network cost reasoning

- Cross-AZ data transfer có thể tính phí.
- NAT Gateway có hourly + data processing; gateway endpoint giảm NAT path cho S3/DynamoDB.
- Interface endpoint có hourly/data cost nhưng giảm NAT/public path và tăng private access.
- TGW/PrivateLink/DX đều có pricing dimensions; chọn topology đơn giản nhất đáp ứng scale/security.
- CloudFront giảm origin transfer cho cacheable content.
- Đặt talkative services cùng AZ có thể giảm cost nhưng không hy sinh required HA.

## 15. Scenario reasoning

### A. 3 VPC kết nối full mesh

Peering có thể chấp nhận với 3; 50 VPC → Transit Gateway để giảm N² và central routes.

### B. SaaS expose API private cho 200 customer VPCs

PrivateLink endpoint service, không peering 200 VPCs.

### C. On-prem app cần private S3

DX/VPN → S3 interface endpoint/private DNS pattern, hoặc public VIF/service public endpoint tùy requirement. Gateway endpoint không trực tiếp từ on-prem.

### D. Dedicated link nhưng data phải encrypted

DX + VPN over DX hoặc supported MACsec; DX alone không mặc định đáp ứng encryption statement.

### E. Users làm việc từ nhà cần VPC

AWS Client VPN, không Site-to-Site VPN cho từng laptop.

## 16. Exam traps

- Peering không transitive.
- TGW không tự bypass overlapping CIDRs.
- PrivateLink là service access, không full bidirectional routing.
- Gateway endpoint chỉ S3/DynamoDB và không direct on-prem.
- Interface endpoint cần SG/DNS/endpoint policy đúng.
- DX không tự encrypted và provisioning chậm.
- VPN có hai tunnels nhưng customer phải configure cả hai để HA.
- Shared subnet không chuyển VPC ownership cho participant.

Tiếp theo: [ELB, Route 53 và Edge](03-ELB-ROUTE53-EDGE.md).
