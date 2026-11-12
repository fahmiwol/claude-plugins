# Agent Team

**Run work through a full team of AI agent roles, and map an app before you redesign it.**

One lead session decides and checks. Eleven small subagents do the rest: research, design, build, review,
test, validate, verify, judge "done", and write the docs. Two skills tell Claude how to run them.

## Install

```
/plugin marketplace add fahmiwol/claude-plugins
/plugin install agent-team@fahmiwol
```

Nothing to configure. No MCP server, no API key, no telemetry.

## What is in it

### Skill `agent-team`
**The team method.** Roster with a model per role, the flow (research, design and plan, owner approves,
build, then review + QC + validate + verify in parallel, evaluator verdict, write docs), the brief
contract, frugality rules, and the pitfalls that really happened: roles cut off by turn limits, a
new agent "not found" for a moment, role reports that are not proof, decision-card premises that were not
checked, and cross-repository requests.

Reach for it when you have a feature, a research-to-build task, a UI overhaul or a backlog, and you want it
fast, cheap and checked by someone other than the maker.

### Skill `page-feature-map`
**Map every page's features before redesigning an existing web app.** A researcher reads code, navigation
data and specs; the lead only looks at logged-in pages; a designer starts after the map; the owner
approves before code. Fixed output format (per-page tables with REAL / STUB / PLANNED and `file:line`, a
gap table, UX problems, navigation counted by status, components and tokens).

Reach for it when someone says "redesign this console" and nobody knows what the console really has.

### Agents (`agents/`)
| Agent | Does | Writes? | Model |
|---|---|---|---|
| `researcher` | evidence, including what contradicts the plan | result file | sonnet |
| `designer` | concept and stepwise plan with red-test acceptance checks | design docs | sonnet |
| `builder` | one approved step: red test first, smallest diff, own worktree | code on its branch | sonnet (opus for auth, tokens, tenant isolation, permissions, money, data migration, external senders) |
| `code-reviewer` | cold read of a diff against its spec | no | sonnet |
| `security-reviewer` | per-area verdicts and a gate verdict | no | opus |
| `qc-tester` | tries to break it; missing tests; mini mutation; real browser | test files only | sonnet |
| `validator` | is it what the owner actually asked for? | no | sonnet |
| `verifier` | is every claim true at the primary source? | no | sonnet |
| `evaluator` | DONE / NOT YET per acceptance check, from real state | no | sonnet |
| `writer` | docs from existing facts only | docs only | sonnet |
| `specialist` | expert lens (UX, AI, audio, maths...) as advice | no | sonnet |

Maker is not checker. Reviewers are read-only. Mutation tests run only through a script that restores files in a
`finally` block.

## Where this came from

An internal multi-agent build for a company console, November 2026: a lead session, a research-to-build
flow, and a list of things that went wrong on the way. Those failures are written into the skills on
purpose. A method with no scar tissue behind it is just an opinion.

## Licence

MIT.

## Related

- **[agent-craft](../agent-craft)**: methods for building agent systems that hold up (eight-gate change
  loop, repo handoff).
- **[ship-check](../ship-check)**: verify what you shipped is what people receive.

---

## Bahasa Indonesia

**Jalankan pekerjaan lewat satu tim peran agen AI, dan petakan aplikasi sebelum mendesain ulang.**

Satu sesi pemimpin memutuskan dan memeriksa. Sebelas subagen kecil mengerjakan sisanya: riset, rancangan,
pembuatan, tinjauan, pengujian, validasi, verifikasi fakta, vonis "selesai", dan penulisan dokumen. Dua skill
menjelaskan kepada Claude cara menjalankannya.

### Pasang

```
/plugin marketplace add fahmiwol/claude-plugins
/plugin install agent-team@fahmiwol
```

Tidak ada yang perlu diatur. Tanpa server MCP, tanpa kunci API, tanpa telemetri.

### Isinya

**Skill `agent-team`: metode tim.** Daftar peran dengan model untuk tiap peran, alur kerja (riset,
rancangan dan rencana, pemilik menyetujui, pembuatan, lalu tinjauan + QC + validasi + verifikasi berjalan
bersamaan, vonis penilai, tulis dokumen), kontrak brief, aturan hemat, dan jebakan yang benar-benar terjadi:
peran terhenti oleh batas langkah, agen baru yang sesaat "tidak ditemukan", laporan peran yang bukan bukti,
premis di kartu keputusan yang belum dicek, dan permintaan lintas repositori.

Pakai saat ada fitur, tugas dari riset sampai jadi, perombakan UI, atau antrean pekerjaan, dan kamu ingin
hasilnya cepat, murah, dan diperiksa orang lain, bukan oleh pembuatnya.

**Skill `page-feature-map`: peta fitur per halaman.** Petakan fitur tiap halaman sebelum mendesain ulang
aplikasi web yang sudah ada. Peneliti membaca kode, data navigasi, dan spesifikasi; pemimpin hanya melihat
halaman yang butuh login; perancang baru mulai setelah peta jadi; pemilik menyetujui sebelum ada kode.
Format keluarannya tetap: tabel per halaman dengan status NYATA / STUB / RENCANA beserta `berkas:baris`, tabel
kesenjangan, masalah UX, navigasi dihitung per status, serta komponen dan token.

Pakai saat ada yang bilang "desain ulang konsol ini" padahal belum ada yang tahu isi konsolnya.

**Agen (`agents/`).**

| Agen | Tugas | Boleh menulis? | Model |
|---|---|---|---|
| `researcher` | mencari bukti, termasuk yang membantah rencana | berkas hasil | sonnet |
| `designer` | konsep dan rencana bertahap dengan cek penerimaan berupa uji merah | dokumen rancangan | sonnet |
| `builder` | satu langkah yang sudah disetujui: uji merah dulu, perubahan sekecil mungkin, worktree sendiri | kode di cabangnya | sonnet (opus untuk auth, token, isolasi tenant, izin, uang, migrasi data, pengirim keluar) |
| `code-reviewer` | baca dingin sebuah diff terhadap spesifikasinya | tidak | sonnet |
| `security-reviewer` | vonis per area dan vonis gerbang | tidak | opus |
| `qc-tester` | mencoba merusak; menambah uji yang hilang; mutasi kecil; peramban sungguhan | hanya berkas uji | sonnet |
| `validator` | apakah ini memang yang diminta pemilik? | tidak | sonnet |
| `verifier` | apakah setiap klaim benar di sumber primernya? | tidak | sonnet |
| `evaluator` | SELESAI / BELUM per cek penerimaan, dari keadaan nyata | tidak | sonnet |
| `writer` | dokumen dari fakta yang sudah ada saja | hanya dokumen | sonnet |
| `specialist` | sudut pandang ahli (UX, AI, audio, matematika...) sebagai saran | tidak | sonnet |

Pembuat bukan pemeriksa. Peninjau hanya membaca. Uji mutasi hanya lewat skrip yang memulihkan berkas di
blok `finally`.

### Asalnya

Sebuah pembangunan multi-agen internal untuk konsol perusahaan, November 2026: satu sesi pemimpin, alur dari
riset sampai jadi, dan daftar hal yang salah di tengah jalan. Kegagalan itu sengaja ditulis di dalam skill.
Metode tanpa bekas luka hanyalah pendapat.

### Lisensi

MIT.
