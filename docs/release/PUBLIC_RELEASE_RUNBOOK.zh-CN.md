# @aqualy/ui 公开发布 Runbook

当前阶段：DS-EXTRACT-01C1 **准备**，2026-10-14。候选 `0.1.0-next.0` / `next`，未发布。代码/tokens/CSS采用MIT；官方Logo和品牌素材遵守 BRAND_USAGE.md，不进入SDK。

## 源码与本轮边界

唯一可编辑源码在私有 `aqualyteam/aqualy-design` 的 `packages/aqualy-ui`。公开 `aqualyteam/aqualy-ui` 是生成的只读快照；公开workflow、发布脚本与修复均先在私有来源修改，再导出、审查、正常历史保留的刷新。内部审计、品牌素材、私有Git历史不进入镜像。

本轮允许候选版本/CHANGELOG、公开流程配置、受保护GitHub environment、真实无发布CI与候选artifact验证。**不允许 npm publish、npm stage publish、dist-tag修改、创建发布token、产品依赖切换或Vercel部署。** 没有数据库改动，不需要migration。

## 1. 身份与工具链

npm只读核对：`whoami`为 `anthonychoi`；组织 `aqualy` 中角色Owner，`aqualy:developers`当前仅此成员；2FA为 `auth-and-writes`。组织/团队已授权包列表为空，匿名registry对 `@aqualy/ui` 返回404。组织资格不代替目标包级ACL或OIDC实测。

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

首次发布的独立授权可以采用当前Owner交互式2FA，使用已批准artifact通过受控 `publish-release.mjs --bootstrap`；脚本会再次核对账号、Owner、工具链、policy与同版本registry404。不要收集密码/OTP到聊天、文件或GitHub secret；维护者在自己的终端完成挑战。不创建长期发布token。bootstrap没有自动GitHub OIDC provenance，须保留真实NOT RUN，不把本地pack写成有来源证明。

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
- 本轮NOT RUN：bootstrap、npm端Trusted Publisher、OIDC token exchange、provenance、registry写入/取回、C2产品接入与Vercel。
- 超过artifact保留期时不能悄悄repack或重跑取代批准SHA：重新准备与批准新的实际artifact。

## 6. 后续产品迁移

C2 registry consumer → D0 隔离主项目接入演练 → D1 精确依赖切换 → E 稳定发布分别授权。原主项目仍消费自己的workspace包。回滚恢复消费者精确版本，不删除已分发MIT产物、历史或数据库。
