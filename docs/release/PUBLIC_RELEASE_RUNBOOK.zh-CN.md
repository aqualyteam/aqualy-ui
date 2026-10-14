# @aqualy/ui 公开发布 Runbook

当前阶段：DS-EXTRACT-01C1 **首次 bootstrap 已上传并核对内容**，2026-10-14。`0.1.0-next.0` 已发布至 `next`；npm 自动添加的 `latest` 删除曾被 registry 拒绝（HTTP400）；Owner现已明确接受本次精确首包标签例外，C2匿名registry消费者验证进行中。代码/tokens/CSS采用MIT；官方Logo和品牌素材遵守 BRAND_USAGE.md，不进入SDK。

## 源码与本轮边界

唯一可编辑源码在私有 `aqualyteam/aqualy-design` 的 `packages/aqualy-ui`。公开 `aqualyteam/aqualy-ui` 是生成的只读快照；公开workflow、发布脚本与修复均先在私有来源修改，再导出、审查、正常历史保留的刷新。内部审计、品牌素材、私有Git历史不进入镜像。

准备阶段只允许候选与流程验证。随后独立人工授权首次精确 Linux tarball bootstrap 至 `next`，现已上传成功；自动 `latest` 移除已获得明确授权且本人完成认证，但 registry 返回HTTP400，未发生标签变化。当前 policy 已恢复关闭。**不得重复发布本版本、发布其他版本、提升 latest、stage 上传、创建长期 token、绑定 Trusted Publisher、切换产品依赖或部署 Vercel。** 没有数据库改动，不需要 migration。

## 1. 身份与工具链

npm只读核对：`whoami`为 `anthonychoi`；组织 `aqualy` 中角色Owner，`aqualy:developers`当前仅此成员；2FA为 `auth-and-writes`。这些是准备阶段的历史快照。本次重新确认 Owner/auth-and-writes，随后首次公开包已创建；匿名精确版本与 tarball 可取回。组织资格不代替目标包级ACL或OIDC实测。

构建/安装固定 Node24.18.0 + pnpm10.24.0。发布专用 npm11.16.0 来自该Node发行环境，未来只用于身份检查和精确tarball发布；不替换pnpm，不增加项目依赖、不升级锁。流程会检查实际版本，不自动安装最新版npm。

当前GitHub actions使用固定40位commit且声明原生Node24。依赖安装不复用发布缓存，checkout不保留凭据。公共CI与准备job无npm secret、无id-token权限。详见实际workflow与C1证据。

## 2. 本地候选与真实准备CI

1. 私有来源完成 `pnpm verify:source`、`pnpm test`、`pnpm typecheck`、`pnpm verify:release` 与 `git diff --check`，保存历史/产品文件未变证明。
2. Changesets3.0.3已执行 `pre enter next` 和 `version`，生成 `0.1.0-next.0` 及预发布状态。版本生成不是registry发布；下一次候选由新增changeset推进，不覆盖既有版本。
3. `pnpm export:public -- <新的外部绝对目录>`，检查public manifest、MIT、品牌边界与导出文件。不得覆盖已有目录或复制私有 `.git`。
4. 将审查快照作为公开repo现有HEAD的后继提交；仅在批准刷新时暂时解锁main，完成正常push后立即恢复锁定/admin/strict validate/禁止force/delete。
5. 全新匿名clone，frozen安装、types/test/manifest检查。工作树必须clean；根目录与apps继续private。默认源目录 `prepublishOnly` guard保持强制拒绝。
6. `pnpm prepare:release -- --output <新建的外部目录>`：只pack一次，把该tarball直接交给外部匿名Next consumer，不重新pack。验证66子路径、171文件、单React、types/Next production build、36矩阵（3产品×Light/Dark×LTR/RTL×1440/390/320，每组10轮浮层交互）。
7. `prepare-release.yml`仅手动dispatch，输入精确公开main commit；job核对repository/ref/SHA后运行自包含检查和同一archive验证，上传不可覆盖的 `aqualy-ui-candidate-<source SHA>`，保留30天。无发布权限，不因PR/push/tag自动发布。

产物包含 `.tgz`、`release-receipt.json`、SHA256SUMS和consumer日志/截图。receipt记录源码commit、公开manifest hash、逐文件hash、SHA256、SHA512 integrity及36矩阵。不同平台archive可能不同，必须明确选中一个实际测试过的artifact。工作区不能被prepare修改。

## 3. 本轮发布保护与未来授权

当前三层保护：

- 源目录publish触发 `block-publication.mjs`，强制失败。
- `publish.yml` 的job使用字面量 `if: ${{ false }}`，dispatch/输入/环境变量不能启用。
- `config/release-policy.json` 的 `publishEnabled:false`、`approvedSource:null`、`approvedSha256:null`；发布脚本在运行npm/访问凭据/网络前拒绝。

未来实际发布需要新的明确授权：审核精确公开build commit、候选版本、next tag、archive SHA和完整验收；在canonical审查提交中填写精确source/SHA并启用policy。OIDC job的字面量锁同样须另经审查修改，仅允许公开repo/main/手动dispatch；不得把启用变成环境变量开关。发布控制提交与artifact构建提交可以不同，分别记录，不能把publish job的provenance commit误称为artifact构建commit。

`verify-release-run.mjs`未来会核对准备run来自本repo的main、workflow_dispatch、精确source SHA、指定prepare workflow、completed/success与未过期的唯一artifact；不能消费fork/PR/失败run或任意用户提供的tarball。下载后重新验证archive及全部文件，再执行发布。

## 4. 首次包 bootstrap 与 OIDC

npm当前的[Trusted Publisher文档](https://docs.npmjs.com/trusted-publishers/)从包设置开始配置。当前包未创建，本轮**没有npm端绑定，也不宣称OIDC或provenance已实测**。

首次发布已采用 Owner 交互式安全密钥认证，通过受控 `publish-release.mjs --bootstrap` 上传批准的 Linux artifact。此处流程供后续复核，禁止重新发布同版本；脚本会再次核对账号、Owner、工具链、policy与同版本registry404。不要收集密码/OTP到聊天、文件或GitHub secret；维护者在自己的终端完成挑战。不创建长期发布token。bootstrap没有自动GitHub OIDC provenance，须保留真实NOT RUN，不把本地pack写成有来源证明。

包创建后，另行确认并添加如下Trusted Publisher：

| 字段 | 精确值 |
| --- | --- |
| GitHub Organization/user | aqualyteam |
| Repository | aqualy-ui |
| Workflow filename | publish.yml |
| Environment | npm-release |
| Allowed actions | 明确允许npm publish；不授权dist-tag管理 |

新配置须在2天内完成首次成功发布，否则会过期；应在下一候选实际发布窗口绑定，不能现在提前绑定后闲置。新配置默认stage权限不等于直接publish权限，本计划不执行stage上传。实际页面/CLI权限再次核对，不猜测。

后续OIDC使用GitHub-hosted Ubuntu runner、job级 `id-token:write`，限定npm-release；公开repo/公开包可自动生成provenance。发布脚本禁止NODE_AUTH_TOKEN/NPM_TOKEN回落；runner使用独立匿名npmrc。GitHub environment要求维护者审批、禁止管理员绕过，仅允许protected branches；本轮仅main受保护，未来若新增protected branch需同步收窄规则。只有一个维护者时允许其自审environment，但不能绕过静态发布锁或policy。

发布通过 `node scripts/publish-release.mjs --oidc` 消费已验收tarball；没有递归workspace发布、ignore-scripts、源目录发布或自动重建。当前policy锁定唯一候选版本；首次bootstrap后该版本不可再次OIDC发布。需要新的Changeset/候选版本与完整验证，才可验证首个OIDC发布。

## 5. 上传结果、取回和停止条件

- 上传失败或结果不明确：先匿名查询同一版本。存在则核对产物；不盲目重传、不覆盖、不强制、不unpublish。
- `verify-registry-release.mjs`匿名获取精确版本与tarball，检查LICENSE metadata、SHA512 integrity、archive逐字节相同和next tag；出错时停止产品接入。
- 实际provenance须检查attestation签名、subject digest及对应workflow/run/publisher commit。脚本仅记录attestation是否存在，不把存在当作密码学验证PASS。
- 有包版本/上传成功不等于消费者验收完成。C2再从registry在无认证/空store的独立Next项目安装，禁止回落到本地workspace/tarball。
- 本次 bootstrap/匿名下载/hash/integrity/next 指向均 PASS；npm 自动 latest 清理在本人认证后被 registry HTTP400 拒绝。首次上传认证失效后的重试仅在确认版本404并经用户要求重新认证后进行，没有重复上传已存在版本。
- NOT RUN：npm Trusted Publisher、OIDC token exchange、provenance、C2 registry consumer 安装、产品依赖切换与 Vercel。
- 自动 latest 清理实测：Owner 认证通过后执行 `npm dist-tag rm @aqualy/ui latest --registry https://registry.npmjs.org/`，npm 返回 E400/HTTP400；匿名核对标签未变。当前 registry 拒绝这个包的 latest 删除，不再把问题标成认证待完成。停止重复挑战、重试上传或绕过 registry。next-only assertion 保持严格，不静默改成 PASS。
- [npm 官方仓库 #8490](https://github.com/npm/cli/issues/8490)记录了首次其它标签发布仍自动附加 latest 的行为，以及删除 latest 返回400的同类报告。该案例佐证当前观测；不将其推定为适用于所有 registry 的完整正式协议规则。是否接受暂存 latest 的例外，或先由 Owner 向 npm 确认限制，应独立决定；本轮未联系第三方、未批准例外、未发新版本。
- 超过artifact保留期时不能悄悄repack或重跑取代批准SHA：重新准备与批准新的实际artifact。

## 6. 后续产品迁移

C2 registry consumer → D0 隔离主项目接入演练 → D1 精确依赖切换 → E 稳定发布分别授权。原主项目仍消费自己的workspace包。回滚恢复消费者精确版本，不删除已分发MIT产物、历史或数据库。

## 7. 首次发布实际记录

保留 Linux 构建 source `70e1789568621cbef493cd5319b4556cb5704634`；发布授权控制 commit `a3311d64610916f51cb8936b1ce614554ec33dea`。SHA256 `948552994c0dfc74e15653268872a816f2e2821adc40fcaf6687dc6a453bb48c`，171 个成员，66 exports；原 archive 未重建/repack。bootstrap 没有 GitHub OIDC provenance。匿名下载保留为独立 registry archive；SHA512 integrity 与原 tarball 逐字节相同。实际标签为 next/latest 同指向该候选，latest 清理未完成；未宣称稳定版发布或 C2 安装通过。冻结 C1 准备证据不覆盖。

## 8. 标签删除最终核验（2026-10-14）

Owner 本人认证完成，registry DELETE 拒绝（HTTP400）；最终 tags 为 next/latest 均指向 0.1.0-next.0。匿名精确版本、MIT metadata、原 Linux SHA256/SHA512 integrity、171 文件和逐字节比对均 PASS；only-next FAIL。阻塞属于服务端操作结果，不是继续等待本人认证。不以创建占位版本、unpublish、修改包文档的原始 registry 数据或变更发布者配置绕过。发布policy/source hook/OIDC job保持关闭，产品依赖未切换，C2/OIDC/provenance未执行。

## 9. C2 首包标签明确验收例外与匿名安装

2026-10-14 Owner明确接受首次latest保留；仅绑定版本0.1.0-next.0、build source70e1789568621cbef493cd5319b4556cb5704634与已核对Linux SHA948552994c0dfc74e15653268872a816f2e2821adc40fcaf6687dc6a453bb48c。旧删除HTTP400/only-next FAIL证据不修改、不升级为成功。config/registry-consumer.json是独立C2只读合同，要求当前tags恰为next/latest同指向该候选；不是通用latest豁免，更不是稳定版或发布授权。原verify-registry-release的严格only-next断言保留。

C2命令：`node scripts/verify-c0-consumer.mjs --registry`。全新workspace外Next项目，匿名user/global配置并移除继承凭据，第一空store安装精确registry版本，第二独立空store按同一lock冻结安装；不得pack/file/link/workspace fallback。检查版本/URL/integrity与171已安装成员hash、66imports/单React、types/Next production/SSR/fonts/OpenType、36三产品/Light-Dark/LTR-RTL/1440-390-320矩阵、每组10轮浮层操作。公开CI相同模式且无发布/id-token权限。公开文档从私有canonical生成；原registry archive不改写，即使新的source README更新。原已发布README中的unpublished是准备快照，后续新版本才可更正archive，本轮不重发。

实际C2结果记录在新的阶段文件；Vercel读取/部署、OIDC/provenance、D0/D1产品演练/切换另行授权。本轮无数据库迁移、不写主项目。
