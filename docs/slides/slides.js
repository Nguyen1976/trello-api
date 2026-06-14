const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

const C = {
  bg: "0A0E1A",           // Very dark navy
  bgCard: "0F1629",       // Slightly lighter card bg
  bgSlide: "060B14",      // Darkest bg for title/section
  navy: "0D1B3E",         // Dark navy
  blue: "1A3A6B",         // Medium blue
  neonBlue: "00D4FF",     // Neon cyan
  neonGreen: "00FF9D",    // Neon green
  neonPurple: "B44FFF",   // Neon purple
  neonYellow: "FFD700",   // Gold/yellow accent
  white: "FFFFFF",
  lightGray: "C8D0E0",
  midGray: "6B7A9A",
  darkGray: "2A3550",
  cardBorder: "1E3A6E",
};

async function iconToBase64Png(IconComponent, color, size = 256) {
  const { renderToStaticMarkup } = ReactDOMServer;
  const svg = renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

async function main() {
  const { FaCode, FaFlask, FaBug, FaCheckCircle, FaShieldAlt, FaRocket,
          FaChartBar, FaTools, FaLayerGroup, FaDatabase, FaCog, FaGlobe } = require("react-icons/fa");
  const { MdSecurity, MdBuild } = require("react-icons/md");

  // Pre-render icons
  const iconCode   = await iconToBase64Png(FaCode,       "#00D4FF");
  const iconFlask  = await iconToBase64Png(FaFlask,      "#00FF9D");
  const iconBug    = await iconToBase64Png(FaBug,        "#FF4D6D");
  const iconCheck  = await iconToBase64Png(FaCheckCircle,"#00FF9D");
  const iconShield = await iconToBase64Png(FaShieldAlt,  "#B44FFF");
  const iconRocket = await iconToBase64Png(FaRocket,     "#00D4FF");
  const iconChart  = await iconToBase64Png(FaChartBar,   "#FFD700");
  const iconTools  = await iconToBase64Png(FaTools,      "#00D4FF");
  const iconLayer  = await iconToBase64Png(FaLayerGroup, "#B44FFF");
  const iconDB     = await iconToBase64Png(FaDatabase,   "#00FF9D");
  const iconGlobe  = await iconToBase64Png(FaGlobe,      "#00D4FF");
  const iconCog    = await iconToBase64Png(FaCog,        "#FFD700");

  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Kiểm Thử Phần Mềm Trello";

  // ─────────────────────────────────────────────────────────────
  // SLIDE 1 — TITLE
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bgSlide };

    // Left accent glow bar
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonBlue } });

    // Top subtle accent
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.neonBlue } });

    // Background tech grid dots (decorative rectangles)
    for (let i = 0; i < 8; i++) {
      s.addShape(pres.shapes.OVAL, {
        x: 7.5 + (i % 3) * 0.6, y: 0.3 + Math.floor(i / 3) * 0.6,
        w: 0.08, h: 0.08,
        fill: { color: C.neonBlue, transparency: 70 },
        line: { color: C.neonBlue, transparency: 70, width: 0 }
      });
    }

    // University label
    s.addText("ĐẠI HỌC PHENIKAA — TRƯỜNG CÔNG NGHỆ THÔNG TIN", {
      x: 0.5, y: 0.5, w: 9, h: 0.4,
      fontSize: 11, color: C.midGray, align: "left", margin: 0,
      charSpacing: 1
    });

    // Main title
    s.addText("KIỂM THỬ PHẦN MỀM", {
      x: 0.5, y: 1.15, w: 7.5, h: 0.8,
      fontSize: 38, bold: true, color: C.white, align: "left", margin: 0
    });

    // Neon subtitle
    s.addText("TRELLO", {
      x: 0.5, y: 1.95, w: 5, h: 1.0,
      fontSize: 72, bold: true, color: C.neonBlue, align: "left", margin: 0
    });

    // Decorative neon line
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.1, w: 3.5, h: 0.04, fill: { color: C.neonGreen } });

    // Course info
    s.addText([
      { text: "Môn: ", options: { color: C.midGray } },
      { text: "Đánh Giá và Kiểm Thử Phần Mềm", options: { color: C.lightGray } },
    ], { x: 0.5, y: 3.3, w: 9, h: 0.35, fontSize: 12, margin: 0 });

    s.addText([
      { text: "Lớp: ", options: { color: C.midGray } },
      { text: "CSE703010-1-3-25(COUR01.LT4)  |  Khoá K17 (2023–2027)", options: { color: C.lightGray } },
    ], { x: 0.5, y: 3.65, w: 9, h: 0.35, fontSize: 12, margin: 0 });

    s.addText([
      { text: "GV hướng dẫn: ", options: { color: C.midGray } },
      { text: "Thầy Trương Đức Phương", options: { color: C.neonYellow } },
    ], { x: 0.5, y: 4.0, w: 9, h: 0.35, fontSize: 12, margin: 0 });

    // Team members
    const members = ["Nguyễn Hà Nguyên (23010310)", "Hoàng Lê Đức Huy (23010298)", "Ngô Đặng Nhật Dũng (23010329)", "Nguyễn Đức Minh (23010302)", "Nguyễn Duy Hiệu (23010363)"];
    s.addText(members.map((m, i) => ({
      text: m + (i < members.length - 1 ? "   " : ""),
      options: { color: i === 0 ? C.neonGreen : C.lightGray }
    })), { x: 0.5, y: 4.4, w: 9.2, h: 0.9, fontSize: 10.5, margin: 0, wrap: true });

    // Rocket icon
    s.addImage({ data: iconRocket, x: 8.5, y: 2.0, w: 1.0, h: 1.0 });

    // Bottom date
    s.addText("Hà Nội, tháng 06 năm 2026", {
      x: 0, y: 5.3, w: 10, h: 0.3,
      fontSize: 10, color: C.midGray, align: "center", margin: 0
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 2 — MỤC LỤC
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonPurple } });

    s.addText("MỤC LỤC", { x: 0.3, y: 0.3, w: 4, h: 0.5, fontSize: 28, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.82, w: 1.5, h: 0.04, fill: { color: C.neonPurple } });

    const chapters = [
      ["01", "Giới thiệu & Phạm vi", C.neonBlue],
      ["02", "Phân tích & Xây dựng hệ thống", C.neonGreen],
      ["03", "Kiểm thử hộp đen", C.neonBlue],
      ["04", "Kiểm thử hộp trắng", C.neonGreen],
      ["05", "Kiểm thử tự động", C.neonPurple],
      ["06", "Kiểm thử nâng cao (Fuzz & Mutation)", C.neonYellow],
      ["07", "Đánh giá & Nhận xét", C.neonBlue],
    ];

    chapters.forEach(([num, title, color], i) => {
      const col = i < 4 ? 0 : 1;
      const row = i < 4 ? i : i - 4;
      const x = col === 0 ? 0.3 : 5.3;
      const y = 1.1 + row * 0.98;

      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.5, h: 0.78,
        fill: { color: C.bgCard },
        shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.3 }
      });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 0.78, fill: { color } });

      s.addText(num, { x: x + 0.14, y: y + 0.12, w: 0.5, h: 0.4, fontSize: 18, bold: true, color, margin: 0 });
      s.addText(title, { x: x + 0.7, y: y + 0.16, w: 3.6, h: 0.45, fontSize: 12.5, color: C.lightGray, margin: 0, valign: "middle" });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 3 — GIỚI THIỆU & MỤC TIÊU
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonBlue } });

    s.addText("GIỚI THIỆU & MỤC TIÊU", { x: 0.3, y: 0.25, w: 7, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonBlue } });

    // Left column - system description
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.0, w: 4.5, h: 4.1,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.0, w: 4.5, h: 0.06, fill: { color: C.neonBlue } });

    s.addText("Hệ thống Trello Clone", { x: 0.45, y: 1.1, w: 4.2, h: 0.4, fontSize: 14, bold: true, color: C.neonBlue, margin: 0 });

    const desc = [
      ["Backend:", "Node.js / Express + MongoDB"],
      ["Frontend:", "React 18 + Vite + Redux Toolkit"],
      ["Auth:", "JWT (httpOnly cookie)"],
      ["Validation:", "Joi (BE) + React Hook Form (FE)"],
      ["Drag & Drop:", "dnd-kit"],
      ["Upload:", "Multer + Cloudinary"],
    ];
    desc.forEach(([k, v], i) => {
      s.addText([
        { text: k + " ", options: { color: C.neonGreen, bold: true } },
        { text: v, options: { color: C.lightGray } }
      ], { x: 0.45, y: 1.6 + i * 0.55, w: 4.1, h: 0.45, fontSize: 12, margin: 0 });
    });

    s.addImage({ data: iconCode, x: 4.1, y: 1.1, w: 0.5, h: 0.5 });

    // Right column - goals
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.0, w: 4.6, h: 4.1,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.0, w: 4.6, h: 0.06, fill: { color: C.neonGreen } });

    s.addText("Mục Tiêu Đề Tài", { x: 5.25, y: 1.1, w: 4, h: 0.4, fontSize: 14, bold: true, color: C.neonGreen, margin: 0 });

    const goals = [
      ["13 Use Cases", "UC01–UC13 đầy đủ"],
      ["83 Test Cases", "Integration API"],
      ["31 Test Cases", "RTL Component"],
      ["13 E2E Scenarios", "Selenium WebDriver"],
      ["100% Coverage", "utils/middleware/validation"],
      ["97.92%", "Mutation Score"],
      ["9 Fuzz Properties", "300–1000 numRuns/prop"],
    ];
    goals.forEach(([stat, desc], i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 5.25, y: 1.62 + i * 0.48, w: 4.3, h: 0.38,
        fill: { color: C.navy },
        shadow: { type: "outer", color: "000000", blur: 4, offset: 1, angle: 135, opacity: 0.2 }
      });
      s.addText([
        { text: stat + "  ", options: { color: C.neonYellow, bold: true, fontSize: 13 } },
        { text: desc, options: { color: C.lightGray, fontSize: 11 } },
      ], { x: 5.35, y: 1.64 + i * 0.48, w: 4.1, h: 0.35, margin: 0, valign: "middle" });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 4 — KIẾN TRÚC HỆ THỐNG & DATABASE
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonGreen } });

    s.addText("KIẾN TRÚC HỆ THỐNG", { x: 0.3, y: 0.25, w: 7, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonGreen } });

    // Architecture layers
    const layers = [
      { label: "BROWSER", sub: "React 18 + Vite + Redux Toolkit", color: C.neonBlue, y: 1.05 },
      { label: "API GATEWAY", sub: "Express.js + JWT Middleware + Joi Validation", color: C.neonGreen, y: 1.95 },
      { label: "SERVICE LAYER", sub: "userService · boardService · columnService · cardService", color: C.neonPurple, y: 2.85 },
      { label: "DATABASE", sub: "MongoDB (Mongoose ODM) — Collections: users, boards, columns, cards, invitations", color: C.neonYellow, y: 3.75 },
    ];

    layers.forEach(({ label, sub, color, y }) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 5.4, h: 0.75,
        fill: { color: C.bgCard },
        shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.25 }
      });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 1.4, h: 0.75, fill: { color, transparency: 80 } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.05, h: 0.75, fill: { color } });
      s.addText(label, { x: 0.42, y: y + 0.05, w: 1.2, h: 0.3, fontSize: 9, bold: true, color, margin: 0, charSpacing: 1 });
      s.addText(sub, { x: 1.8, y: y + 0.16, w: 3.75, h: 0.42, fontSize: 11.5, color: C.lightGray, margin: 0, valign: "middle" });
    });

    // Arrows between layers
    [1.83, 2.73, 3.63].forEach(y => {
      s.addShape(pres.shapes.RECTANGLE, { x: 2.7, y, w: 0.06, h: 0.15, fill: { color: C.midGray } });
    });

    // Right — USE CASES summary
    s.addShape(pres.shapes.RECTANGLE, { x: 6.0, y: 1.05, w: 3.7, h: 4.45,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 6.0, y: 1.05, w: 3.7, h: 0.05, fill: { color: C.neonPurple } });

    s.addText("13 Use Cases", { x: 6.1, y: 1.12, w: 3.5, h: 0.38, fontSize: 14, bold: true, color: C.neonPurple, margin: 0 });

    const ucs = [
      "UC01 — Đăng ký tài khoản",
      "UC02 — Xác minh tài khoản",
      "UC03 — Đăng nhập",
      "UC04 — Đăng xuất",
      "UC05 — Xem danh sách board",
      "UC06 — Tạo board",
      "UC07 — Xem chi tiết board",
      "UC08 — Tạo/sửa/xóa column",
      "UC09 — Tạo card",
      "UC10 — Cập nhật card",
      "UC11 — Di chuyển card (Drag)",
      "UC12 — Mời thành viên",
      "UC13 — Cập nhật hồ sơ",
    ];
    ucs.forEach((uc, i) => {
      const col = i < 7 ? 0 : 1;
      const row = i < 7 ? i : i - 7;
      s.addText([
        { text: "▸ ", options: { color: C.neonGreen } },
        { text: uc, options: { color: C.lightGray } }
      ], { x: 6.1 + col * 1.8, y: 1.55 + row * 0.49, w: 1.7, h: 0.42, fontSize: 9.5, margin: 0 });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 5 — KIỂM THỬ HỘP ĐEN: NGUYÊN TẮC & KỸ THUẬT
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonBlue } });

    s.addText("KIỂM THỬ HỘP ĐEN", { x: 0.3, y: 0.25, w: 6, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonBlue } });
    s.addText("Nguyên tắc & Kỹ thuật thiết kế", { x: 0.3, y: 0.82, w: 9, h: 0.3, fontSize: 12, color: C.midGray, margin: 0 });

    // 3 technique cards
    const techs = [
      {
        title: "Phân Lớp Tương Đương",
        color: C.neonBlue,
        items: ["Email: đúng/sai định dạng", "Password: 8–256 ký tự, có chữ+số", "Board title: 3–50 ký tự", "ObjectId: 24 ký tự hex", "File: jpg/jpeg/png ≤ 10MB"],
        icon: iconLayer,
      },
      {
        title: "Phân Tích Giá Trị Biên",
        color: C.neonGreen,
        items: ["Title: 2 (✗), 3 (✓), 50 (✓), 51 (✗)", "Password: 7 (✗), 8 (✓), 256 (✓)", "File size: 10MB (✓), 10MB+1 (✗)", "ObjectId: 24-hex (✓), 23/25 (✗)", "Description: 2 (✗), 3 (✓)"],
        icon: iconChart,
      },
      {
        title: "3 Tầng Kiểm Thử",
        color: C.neonPurple,
        items: ["API Integration (Supertest)", "UI Component (React Testing Library)", "E2E Browser (Selenium WebDriver 4)", "Kiểm thử thủ công (18 kịch bản)", "Passive security checks"],
        icon: iconGlobe,
      },
    ];

    techs.forEach(({ title, color, items, icon }, i) => {
      const x = 0.3 + i * 3.2;
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 3.0, h: 4.05,
        fill: { color: C.bgCard },
        shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
      });
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 3.0, h: 0.06, fill: { color } });

      s.addImage({ data: icon, x: x + 0.1, y: 1.28, w: 0.45, h: 0.45 });
      s.addText(title, { x: x + 0.6, y: 1.3, w: 2.3, h: 0.42, fontSize: 12, bold: true, color, margin: 0, valign: "middle" });

      items.forEach((item, j) => {
        s.addShape(pres.shapes.RECTANGLE, { x: x + 0.15, y: 1.88 + j * 0.62, w: 2.7, h: 0.52,
          fill: { color: C.navy }
        });
        s.addText([
          { text: "• ", options: { color } },
          { text: item, options: { color: C.lightGray } }
        ], { x: x + 0.2, y: 1.9 + j * 0.62, w: 2.6, h: 0.48, fontSize: 10.5, margin: 0, valign: "middle" });
      });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 6 — API INTEGRATION TEST RESULTS
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonGreen } });

    s.addText("KIỂM THỬ API INTEGRATION", { x: 0.3, y: 0.25, w: 7, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonGreen } });

    // Big stat callouts
    const stats = [
      ["83", "Test Cases", C.neonGreen],
      ["10", "File Test", C.neonBlue],
      ["100%", "PASS Rate", C.neonYellow],
      ["162", "Tests Total", C.neonPurple],
    ];
    stats.forEach(([num, label, color], i) => {
      const x = 0.3 + i * 2.35;
      s.addShape(pres.shapes.RECTANGLE, { x, y: 0.9, w: 2.1, h: 1.1,
        fill: { color: C.bgCard },
        shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.25 }
      });
      s.addShape(pres.shapes.RECTANGLE, { x, y: 0.9, w: 2.1, h: 0.05, fill: { color } });
      s.addText(num, { x, y: 0.98, w: 2.1, h: 0.6, fontSize: 36, bold: true, color, align: "center", margin: 0 });
      s.addText(label, { x, y: 1.6, w: 2.1, h: 0.3, fontSize: 10, color: C.midGray, align: "center", margin: 0 });
    });

    // Test groups table
    const groups = [
      ["Đăng ký / Xác minh", "5+5", "TC-BB-REG / VER", C.neonBlue],
      ["Đăng nhập / Đăng xuất", "5+1", "TC-BB-LOGIN / LOGOUT", C.neonBlue],
      ["JWT & Refresh Token", "5+3", "TC-BB-JWT / REFRESH", C.neonGreen],
      ["Board CRUD + BVA", "16", "TC-BB-BOARDS-*", C.neonGreen],
      ["Column CRUD + BVA", "10", "TC-BB-COL-*", C.neonPurple],
      ["Card CRUD", "7", "TC-BB-CARD-*", C.neonPurple],
      ["Invitation", "8", "TC-BB-INV-*", C.neonYellow],
      ["Passive Security", "7", "TC-SEC-PASSIVE-*", C.neonYellow],
    ];

    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 2.15, w: 9.4, h: 0.38,
      fill: { color: C.blue }
    });
    s.addText("Nhóm Kiểm Thử", { x: 0.4, y: 2.18, w: 4, h: 0.32, fontSize: 11, bold: true, color: C.white, margin: 0 });
    s.addText("Số TC", { x: 4.8, y: 2.18, w: 1, h: 0.32, fontSize: 11, bold: true, color: C.white, margin: 0, align: "center" });
    s.addText("Mã TC", { x: 5.9, y: 2.18, w: 3.7, h: 0.32, fontSize: 11, bold: true, color: C.white, margin: 0 });

    groups.forEach(([group, count, code, color], i) => {
      const y = 2.58 + i * 0.37;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: 0.35,
        fill: { color: i % 2 === 0 ? C.bgCard : C.navy }
      });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.04, h: 0.35, fill: { color } });
      s.addText(group, { x: 0.4, y: y + 0.04, w: 4.3, h: 0.27, fontSize: 11, color: C.lightGray, margin: 0 });
      s.addText(count, { x: 4.8, y: y + 0.04, w: 1, h: 0.27, fontSize: 11, color, bold: true, align: "center", margin: 0 });
      s.addText(code, { x: 5.9, y: y + 0.04, w: 3.7, h: 0.27, fontSize: 10, color: C.midGray, margin: 0 });
    });

    s.addImage({ data: iconFlask, x: 9.2, y: 0.25, w: 0.5, h: 0.5 });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 7 — COMPONENT TEST & SELENIUM E2E
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonPurple } });

    s.addText("COMPONENT TEST & E2E SELENIUM", { x: 0.3, y: 0.25, w: 8, h: 0.5, fontSize: 24, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonPurple } });

    // Left — Component test
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.95, w: 4.5, h: 4.3,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.95, w: 4.5, h: 0.06, fill: { color: C.neonPurple } });
    s.addText("React Testing Library (RTL)", { x: 0.45, y: 1.03, w: 4.2, h: 0.38, fontSize: 13, bold: true, color: C.neonPurple, margin: 0 });
    s.addText("31 Tests — 100% PASS", { x: 0.45, y: 1.38, w: 4.2, h: 0.3, fontSize: 11, color: C.neonGreen, margin: 0, bold: true });

    const rtlTests = [
      ["LoginForm", "6 TC", "Form render, submit, navigate, API call"],
      ["Board Page", "9 TC", "Loading spinner, fetchBoard, moveCard APIs"],
      ["Card Component", "6 TC", "Click modal, placeholder, title, drag handle"],
      ["Validators (FE)", "10 TC", "Email, password, board title, file size"],
    ];
    rtlTests.forEach(([comp, count, desc], i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.8 + i * 0.85, w: 4.2, h: 0.75,
        fill: { color: C.navy }
      });
      s.addText([
        { text: comp, options: { bold: true, color: C.neonBlue } },
        { text: "  " + count, options: { color: C.neonYellow } }
      ], { x: 0.55, y: 1.85 + i * 0.85, w: 3.9, h: 0.3, fontSize: 12, margin: 0 });
      s.addText(desc, { x: 0.55, y: 2.15 + i * 0.85, w: 3.9, h: 0.3, fontSize: 10, color: C.lightGray, margin: 0 });
    });

    // Right — Selenium E2E
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 0.95, w: 4.6, h: 4.3,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 0.95, w: 4.6, h: 0.06, fill: { color: C.neonBlue } });
    s.addText("Selenium WebDriver 4 (E2E)", { x: 5.25, y: 1.03, w: 4.2, h: 0.38, fontSize: 13, bold: true, color: C.neonBlue, margin: 0 });
    s.addText("13 Scenarios — All PASS", { x: 5.25, y: 1.38, w: 4.2, h: 0.3, fontSize: 11, color: C.neonGreen, margin: 0, bold: true });

    const e2eTests = [
      ["TC-E2E-01/02", "Login form + sai mật khẩu"],
      ["TC-E2E-03", "Register form hiển thị"],
      ["TC-E2E-04", "404 Not Found page"],
      ["TC-E2E-05/06", "Protected routes → redirect login"],
      ["TC-E2E-07", "Verification invalid → 404"],
      ["TC-E2E-08/09", "Login hợp lệ → Boards list"],
      ["TC-E2E-10/11", "Settings Account & Security"],
      ["TC-E2E-12", "Board detail page"],
      ["TC-E2E-FULL-01", "Full happy path journey (E2E toàn trình)"],
    ];
    e2eTests.forEach(([id, desc], i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.82 + i * 0.36, w: 4.35, h: 0.32,
        fill: { color: i % 2 === 0 ? C.navy : C.bgCard }
      });
      s.addText([
        { text: "✓ ", options: { color: C.neonGreen } },
        { text: id + "  ", options: { color: C.neonYellow, bold: true } },
        { text: desc, options: { color: C.lightGray } }
      ], { x: 5.25, y: 1.84 + i * 0.36, w: 4.25, h: 0.28, fontSize: 10, margin: 0, valign: "middle" });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 8 — KIỂM THỬ HỘP TRẮNG
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonYellow } });

    s.addText("KIỂM THỬ HỘP TRẮNG", { x: 0.3, y: 0.25, w: 7, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonYellow } });

    // Coverage targets
    const coverageData = [
      { label: "utils/authUtils.js", stmts: 100, branch: 100, color: C.neonBlue },
      { label: "utils/boardUtils.js", stmts: 100, branch: 100, color: C.neonGreen },
      { label: "utils/cardUtils.js", stmts: 100, branch: 100, color: C.neonPurple },
      { label: "middlewares/authMiddleware.js", stmts: 100, branch: 100, color: C.neonBlue },
      { label: "validations/userValidation.js", stmts: 100, branch: 100, color: C.neonGreen },
      { label: "validations/boardValidation.js", stmts: 100, branch: 100, color: C.neonPurple },
      { label: "validations/columnValidation.js", stmts: 100, branch: 100, color: C.neonBlue },
      { label: "validations/cardValidation.js", stmts: 100, branch: 100, color: C.neonGreen },
    ];

    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.95, w: 5.5, h: 4.3,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addText("Coverage Report", { x: 0.45, y: 1.0, w: 5, h: 0.38, fontSize: 14, bold: true, color: C.neonYellow, margin: 0 });

    // Header row
    s.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 1.42, w: 5.4, h: 0.35, fill: { color: C.blue } });
    s.addText("File", { x: 0.45, y: 1.45, w: 2.5, h: 0.28, fontSize: 10, bold: true, color: C.white, margin: 0 });
    s.addText("Stmts%", { x: 3.1, y: 1.45, w: 1.2, h: 0.28, fontSize: 10, bold: true, color: C.white, margin: 0, align: "center" });
    s.addText("Branch%", { x: 4.4, y: 1.45, w: 1.2, h: 0.28, fontSize: 10, bold: true, color: C.white, margin: 0, align: "center" });

    coverageData.forEach(({ label, stmts, branch, color }, i) => {
      const y = 1.82 + i * 0.375;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.35, y, w: 5.4, h: 0.33,
        fill: { color: i % 2 === 0 ? C.navy : C.bgCard }
      });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.35, y, w: 0.04, h: 0.33, fill: { color } });
      s.addText(label, { x: 0.45, y: y + 0.05, w: 2.6, h: 0.24, fontSize: 8.5, color: C.lightGray, margin: 0, valign: "middle" });

      // Progress bar for stmts
      s.addShape(pres.shapes.RECTANGLE, { x: 3.1, y: y + 0.1, w: 1.1, h: 0.14, fill: { color: C.darkGray } });
      s.addShape(pres.shapes.RECTANGLE, { x: 3.1, y: y + 0.1, w: 1.1 * stmts / 100, h: 0.14, fill: { color } });
      s.addText(stmts.toFixed(0) + "%", { x: 3.1, y: y + 0.03, w: 1.2, h: 0.24, fontSize: 9, color, bold: true, align: "center", margin: 0 });

      // Progress bar for branch
      s.addShape(pres.shapes.RECTANGLE, { x: 4.4, y: y + 0.1, w: 1.1, h: 0.14, fill: { color: C.darkGray } });
      s.addShape(pres.shapes.RECTANGLE, { x: 4.4, y: y + 0.1, w: 1.1 * branch / 100, h: 0.14, fill: { color: C.neonYellow } });
      s.addText(branch.toFixed(0) + "%", { x: 4.4, y: y + 0.03, w: 1.2, h: 0.24, fontSize: 9, color: C.neonYellow, bold: true, align: "center", margin: 0 });
    });

    // Total
    s.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 4.85, w: 5.4, h: 0.3, fill: { color: C.blue } });
    s.addText("TỔNG (8 file white-box)", { x: 0.45, y: 4.88, w: 2.6, h: 0.24, fontSize: 9, bold: true, color: C.white, margin: 0, valign: "middle" });
    s.addText("100%", { x: 3.1, y: 4.88, w: 1.2, h: 0.24, fontSize: 10, bold: true, color: C.neonGreen, align: "center", margin: 0, valign: "middle" });
    s.addText("100%", { x: 4.4, y: 4.88, w: 1.2, h: 0.24, fontSize: 10, bold: true, color: C.neonYellow, align: "center", margin: 0, valign: "middle" });

    // Right — Cyclomatic complexity
    s.addShape(pres.shapes.RECTANGLE, { x: 6.1, y: 0.95, w: 3.6, h: 4.3,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addText("Độ phức tạp vòng V(G)", { x: 6.2, y: 1.0, w: 3.4, h: 0.38, fontSize: 12, bold: true, color: C.neonYellow, margin: 0 });

    const complexity = [
      ["authMiddleware.isAuthorized", "V(G)=3", "TB", C.neonBlue],
      ["userService.login", "V(G)=4", "TB", C.neonBlue],
      ["userService.update", "V(G)=6", "Cao", C.neonYellow],
      ["invitationService.updateBoardInvitation", "V(G)=5", "Cao", C.neonYellow],
      ["cardService.update", "V(G)=4", "TB", C.neonGreen],
      ["boardService.getDetails", "V(G)=2", "Thấp", C.neonGreen],
      ["cardUtils.moveCard", "V(G)=4", "TB", C.neonGreen],
      ["70 Unit Tests", "TC-WB-*", "Hộp trắng", C.neonPurple],
    ];

    complexity.forEach(([func, vg, risk, color], i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 6.15, y: 1.48 + i * 0.46, w: 3.45, h: 0.4,
        fill: { color: i % 2 === 0 ? C.navy : C.bgCard }
      });
      s.addText([
        { text: func, options: { color: C.lightGray } },
      ], { x: 6.2, y: 1.51 + i * 0.46, w: 2.3, h: 0.32, fontSize: 8, margin: 0, valign: "middle" });
      s.addText(vg, { x: 8.5, y: 1.51 + i * 0.46, w: 0.62, h: 0.32, fontSize: 8.5, bold: true, color, margin: 0, align: "center", valign: "middle" });
      s.addText(risk, { x: 9.12, y: 1.51 + i * 0.46, w: 0.5, h: 0.32, fontSize: 7.5, color: C.midGray, margin: 0, align: "center", valign: "middle" });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 9 — IMAGE PLACEHOLDER — Test Pyramid
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonPurple } });

    s.addText("KIỂM THỬ TỰ ĐỘNG", { x: 0.3, y: 0.25, w: 7, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonPurple } });
    s.addText("Mô hình Kim Tự Tháp Kiểm Thử (Test Pyramid)", { x: 0.3, y: 0.82, w: 9, h: 0.3, fontSize: 12, color: C.midGray, margin: 0 });

    // Pyramid placeholder
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 5.0, h: 4.1,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 5.0, h: 0.06, fill: { color: C.neonPurple } });

    // Triangle pyramid visual (text-based)
    s.addText("[ HÌNH ẢNH MINH HOẠ ]", { x: 0.5, y: 1.2, w: 5.0, h: 0.4, fontSize: 10, color: C.midGray, align: "center", margin: 0, italic: true });
    s.addText("Test Pyramid Diagram", { x: 0.5, y: 1.55, w: 5.0, h: 0.3, fontSize: 12, color: C.neonPurple, align: "center", margin: 0, bold: true });

    // Pyramid tiers
    const tiers = [
      { label: "E2E Selenium", count: "13 tests", color: C.neonPurple, y: 2.0, w: 2.0, x: 1.75 },
      { label: "Integration API + RTL Component", count: "83+31 tests", color: C.neonBlue, y: 2.85, w: 3.5, x: 1.0 },
      { label: "Unit: utils, middleware, Joi, Fuzz", count: "100% coverage", color: C.neonGreen, y: 3.7, w: 5.0, x: 0.5 },
    ];
    tiers.forEach(({ label, count, color, y, w, x }) => {
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.68, fill: { color, transparency: 75 } });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.04, fill: { color } });
      s.addText([
        { text: label + "  ", options: { bold: true, color } },
        { text: count, options: { color: C.lightGray } }
      ], { x, y: y + 0.1, w, h: 0.48, fontSize: 11, align: "center", margin: 0, valign: "middle" });
    });

    // Right panel — tools
    s.addShape(pres.shapes.RECTANGLE, { x: 5.8, y: 1.1, w: 3.9, h: 4.1,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.8, y: 1.1, w: 3.9, h: 0.06, fill: { color: C.neonBlue } });
    s.addText("Công Cụ & Môi Trường", { x: 5.9, y: 1.18, w: 3.7, h: 0.38, fontSize: 13, bold: true, color: C.neonBlue, margin: 0 });

    const tools = [
      ["Jest", "Test runner + coverage", C.neonGreen],
      ["Supertest", "HTTP black-box API", C.neonBlue],
      ["mongodb-memory-server", "DB in-memory sạch", C.neonGreen],
      ["babel-jest", "Biên dịch ES module", C.neonBlue],
      ["React Testing Library", "Component + DOM sim", C.neonPurple],
      ["@testing-library/user-event", "Mô phỏng nhập liệu", C.neonPurple],
      ["Selenium WebDriver 4", "Chrome headless E2E", C.neonYellow],
      ["ESLint", "Phân tích tĩnh", C.midGray],
    ];
    tools.forEach(([tool, role, color], i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 5.85, y: 1.62 + i * 0.44, w: 3.75, h: 0.38,
        fill: { color: i % 2 === 0 ? C.navy : C.bgCard }
      });
      s.addText([
        { text: tool + "  ", options: { bold: true, color, fontSize: 10.5 } },
        { text: role, options: { color: C.midGray, fontSize: 9.5 } },
      ], { x: 5.9, y: 1.65 + i * 0.44, w: 3.65, h: 0.3, margin: 0, valign: "middle" });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 10 — FUZZ TESTING
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonYellow } });

    s.addText("FUZZ TESTING", { x: 0.3, y: 0.25, w: 5, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonYellow } });
    s.addText("Property-based testing bằng fast-check — 300–1000 numRuns/property", { x: 0.3, y: 0.82, w: 9.4, h: 0.3, fontSize: 12, color: C.midGray, margin: 0 });

    // Stats
    const fuzzStats = [
      ["9", "Properties", C.neonGreen],
      ["4800", "Total Runs", C.neonBlue],
      ["9/9", "PASS", C.neonYellow],
    ];
    fuzzStats.forEach(([n, l, c], i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3 + i * 2.3, y: 1.05, w: 2.1, h: 1.0,
        fill: { color: C.bgCard },
        shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.25 }
      });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3 + i * 2.3, y: 1.05, w: 2.1, h: 0.05, fill: { color: c } });
      s.addText(n, { x: 0.3 + i * 2.3, y: 1.12, w: 2.1, h: 0.55, fontSize: 36, bold: true, color: c, align: "center", margin: 0 });
      s.addText(l, { x: 0.3 + i * 2.3, y: 1.68, w: 2.1, h: 0.28, fontSize: 10, color: C.midGray, align: "center", margin: 0 });
    });

    // Properties table
    const props = [
      ["TC-FUZZ-01", "validateEmail contract", "1000", C.neonBlue],
      ["TC-FUZZ-02", "validatePassword contract", "1000", C.neonBlue],
      ["TC-FUZZ-03", "validateBoardTitle", "1000", C.neonGreen],
      ["TC-FUZZ-04", "moveCard logic (cardUtils)", "300", C.neonGreen],
      ["TC-FUZZ-05", "userValidation.createNew (Joi)", "300", C.neonPurple],
      ["TC-FUZZ-06", "userValidation.update (Joi)", "300", C.neonPurple],
      ["TC-FUZZ-07", "boardValidation.createNew (Joi)", "300", C.neonYellow],
      ["TC-FUZZ-08", "boardValidation.update (Joi)", "300", C.neonYellow],
      ["TC-FUZZ-09", "boardValidation.moveCard (Joi)", "300", C.neonGreen],
    ];

    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 2.15, w: 5.5, h: 0.38, fill: { color: C.blue } });
    ["Test ID", "Property", "Runs"].forEach((h, i) => {
      s.addText(h, { x: 0.4 + [0, 1.2, 4.5][i], y: 2.18, w: [1.1, 3.2, 0.6][i], h: 0.32,
        fontSize: 11, bold: true, color: C.white, margin: 0, align: i === 2 ? "center" : "left" });
    });

    props.forEach(([id, prop, runs, color], i) => {
      const y = 2.58 + i * 0.34;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 5.5, h: 0.30,
        fill: { color: i % 2 === 0 ? C.bgCard : C.navy }
      });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.04, h: 0.30, fill: { color } });
      s.addText(id, { x: 0.4, y: y + 0.04, w: 1.1, h: 0.22, fontSize: 10, color, bold: true, margin: 0 });
      s.addText(prop, { x: 1.6, y: y + 0.04, w: 3.0, h: 0.22, fontSize: 10, color: C.lightGray, margin: 0 });
      s.addText(runs, { x: 4.7, y: y + 0.04, w: 0.9, h: 0.22, fontSize: 10, color: C.neonGreen, bold: true, align: "center", margin: 0 });
      s.addText("✓", { x: 5.45, y: y + 0.04, w: 0.3, h: 0.22, fontSize: 12, color: C.neonGreen, bold: true, align: "center", margin: 0 });
    });

    // Right — explanation
    s.addShape(pres.shapes.RECTANGLE, { x: 6.1, y: 1.05, w: 3.6, h: 4.15,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 6.1, y: 1.05, w: 3.6, h: 0.06, fill: { color: C.neonYellow } });
    s.addText("Fuzz vs Coverage", { x: 6.2, y: 1.13, w: 3.4, h: 0.38, fontSize: 13, bold: true, color: C.neonYellow, margin: 0 });
    s.addImage({ data: iconFlask, x: 9.25, y: 1.1, w: 0.4, h: 0.4 });

    const explains = [
      ["Fuzz", "Khám phá không gian đầu vào ngẫu nhiên với giả thiết mã đúng"],
      ["Mutation", "Khám phá không gian lỗi cài vào mã với giả thiết input cố định"],
      ["Coverage", "Đo lường dòng/nhánh đã chạy qua — không chứng minh test chặt"],
      ["Kết quả", "Fuzz PASS = hàm không crash/throw ngoài hợp đồng"],
      ["Lưu ý", "Fuzz không thay thế integration hay E2E — bổ trợ unit test"],
    ];
    explains.forEach(([k, v], i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 6.15, y: 1.6 + i * 0.7, w: 3.5, h: 0.6,
        fill: { color: C.navy }
      });
      s.addText(k, { x: 6.2, y: 1.63 + i * 0.7, w: 0.85, h: 0.28, fontSize: 10, bold: true, color: C.neonYellow, margin: 0 });
      s.addText(v, { x: 6.2, y: 1.9 + i * 0.7, w: 3.4, h: 0.28, fontSize: 9.5, color: C.lightGray, margin: 0 });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 11 — MUTATION TESTING
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonGreen } });

    s.addText("MUTATION TESTING (STRYKER)", { x: 0.3, y: 0.25, w: 8, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonGreen } });

    // Big stat
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.9, w: 2.5, h: 2.0,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.9, w: 2.5, h: 0.06, fill: { color: C.neonGreen } });
    s.addText("97.92%", { x: 0.3, y: 1.1, w: 2.5, h: 0.9, fontSize: 52, bold: true, color: C.neonGreen, align: "center", margin: 0 });
    s.addText("Mutation Score", { x: 0.3, y: 2.05, w: 2.5, h: 0.35, fontSize: 12, color: C.midGray, align: "center", margin: 0 });
    s.addText("Vượt ngưỡng 80%", { x: 0.3, y: 2.38, w: 2.5, h: 0.38, fontSize: 11, color: C.neonYellow, align: "center", bold: true, margin: 0 });

    // Mutant breakdown
    const mutantStats = [
      ["94", "Killed", C.neonGreen],
      ["2", "Survived", C.neonYellow],
      ["0", "Timeout", C.midGray],
      ["96", "Total", C.neonBlue],
    ];
    mutantStats.forEach(([n, l, c], i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 3.1 + i * 1.65, y: 0.9, w: 1.5, h: 1.2,
        fill: { color: C.bgCard },
        shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.25 }
      });
      s.addShape(pres.shapes.RECTANGLE, { x: 3.1 + i * 1.65, y: 0.9, w: 1.5, h: 0.05, fill: { color: c } });
      s.addText(n, { x: 3.1 + i * 1.65, y: 0.98, w: 1.5, h: 0.65, fontSize: 40, bold: true, color: c, align: "center", margin: 0 });
      s.addText(l, { x: 3.1 + i * 1.65, y: 1.65, w: 1.5, h: 0.28, fontSize: 10, color: C.midGray, align: "center", margin: 0 });
    });

    // File breakdown
    const files = [
      ["authUtils.js", "96.30%", "52 killed / 2 survived / 54 total", C.neonBlue],
      ["boardUtils.js", "100%", "27 killed / 0 survived / 27 total", C.neonGreen],
      ["cardUtils.js", "100%", "15 killed / 0 survived / 15 total", C.neonGreen],
    ];

    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.0, w: 9.4, h: 0.38, fill: { color: C.blue } });
    s.addText("File", { x: 0.4, y: 3.03, w: 2, h: 0.3, fontSize: 11, bold: true, color: C.white, margin: 0 });
    s.addText("Score", { x: 2.5, y: 3.03, w: 1.2, h: 0.3, fontSize: 11, bold: true, color: C.white, align: "center", margin: 0 });
    s.addText("Chi tiết", { x: 3.8, y: 3.03, w: 5.8, h: 0.3, fontSize: 11, bold: true, color: C.white, margin: 0 });

    files.forEach(([file, score, detail, color], i) => {
      const y = 3.43 + i * 0.52;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: 0.46,
        fill: { color: i % 2 === 0 ? C.bgCard : C.navy }
      });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.04, h: 0.46, fill: { color } });
      s.addText(file, { x: 0.4, y: y + 0.1, w: 2.0, h: 0.28, fontSize: 11, color: C.lightGray, margin: 0, bold: true });
      s.addText(score, { x: 2.5, y: y + 0.1, w: 1.2, h: 0.28, fontSize: 13, color, bold: true, align: "center", margin: 0 });
      s.addText(detail, { x: 3.8, y: y + 0.1, w: 5.8, h: 0.28, fontSize: 10.5, color: C.midGray, margin: 0 });
    });

    // Image placeholder
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 5.05, w: 9.4, h: 0.48,
      fill: { color: C.navy }
    });
    s.addText("[ HÌNH ẢNH: Screenshot Stryker Mutation Report (Hình 6.1) ]", {
      x: 0.3, y: 5.08, w: 9.4, h: 0.38,
      fontSize: 10, color: C.neonGreen, align: "center", italic: true, margin: 0
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 12 — SECURITY TEST (OWASP ZAP)
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonPurple } });

    s.addText("SECURITY TEST — OWASP ZAP", { x: 0.3, y: 0.25, w: 8, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonPurple } });
    s.addText("Passive scan: chỉ quan sát traffic HTTP, không tấn công chủ động — đối chiếu OWASP Top 10", {
      x: 0.3, y: 0.82, w: 8.6, h: 0.3, fontSize: 12, color: C.midGray, margin: 0
    });
    s.addImage({ data: iconShield, x: 9.1, y: 0.2, w: 0.55, h: 0.55 });

    // Stat boxes
    const zapStats = [
      ["7", "TC-SEC-PASSIVE", C.neonBlue],
      ["3", "Nhóm OWASP liên quan", C.neonPurple],
      ["Passive", "Chế độ quét ZAP", C.neonGreen],
    ];
    zapStats.forEach(([n, l, c], i) => {
      const x = 0.3 + i * 1.85;
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 1.7, h: 0.85,
        fill: { color: C.bgCard },
        shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.25 }
      });
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 1.7, h: 0.05, fill: { color: c } });
      s.addText(n, { x, y: 1.28, w: 1.7, h: 0.42, fontSize: 24, bold: true, color: c, align: "center", margin: 0 });
      s.addText(l, { x, y: 1.72, w: 1.7, h: 0.3, fontSize: 8.5, color: C.midGray, align: "center", margin: 0 });
    });

    // Table — Bảng 5.12: Ánh xạ TC-SEC-PASSIVE với OWASP Top 10
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 2.15, w: 5.5, h: 0.36, fill: { color: C.blue } });
    s.addText("TC-ID", { x: 0.4, y: 2.18, w: 1.3, h: 0.3, fontSize: 10, bold: true, color: C.white, margin: 0 });
    s.addText("Mô tả / Kết quả mong đợi", { x: 1.75, y: 2.18, w: 2.75, h: 0.3, fontSize: 10, bold: true, color: C.white, margin: 0 });
    s.addText("OWASP", { x: 4.6, y: 2.18, w: 1.2, h: 0.3, fontSize: 10, bold: true, color: C.white, align: "center", margin: 0 });

    const secRows = [
      ["TC-SEC-PASSIVE-01", "GET /v1/status → 200, Content-Type: application/json", "A05", C.neonBlue],
      ["TC-SEC-PASSIVE-02", "GET route không tồn tại → 404", "A05", C.neonBlue],
      ["TC-SEC-PASSIVE-03", "Response không chứa header X-Powered-By", "A05", C.neonBlue],
      ["TC-SEC-PASSIVE-04", "Response nhạy cảm có header Cache-Control: no-store", "A05", C.neonBlue],
      ["TC-SEC-PASSIVE-05", "Set-Cookie sau login chứa cờ HttpOnly", "A07", C.neonPurple],
      ["TC-SEC-PASSIVE-06", "Body register/login không chứa password hoặc hash bcrypt", "A02", C.neonYellow],
      ["TC-SEC-PASSIVE-07", "GET /v1/boards không auth → 401 JSON có statusCode, message", "A05", C.neonBlue],
    ];

    secRows.forEach(([id, desc, owasp, color], i) => {
      const y = 2.51 + i * 0.4;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 5.5, h: 0.38,
        fill: { color: i % 2 === 0 ? C.bgCard : C.navy }
      });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.04, h: 0.38, fill: { color } });
      s.addText(id, { x: 0.4, y, w: 1.3, h: 0.38, fontSize: 8.5, bold: true, color, margin: 0, valign: "middle" });
      s.addText(desc, { x: 1.75, y, w: 2.75, h: 0.38, fontSize: 8.5, color: C.lightGray, margin: 0, valign: "middle" });
      s.addText(owasp, { x: 4.6, y, w: 1.2, h: 0.38, fontSize: 9.5, bold: true, color, align: "center", margin: 0, valign: "middle" });
    });

    // Right panel — Bảng 5.13: Lỗ hổng mục tiêu & biện pháp
    s.addShape(pres.shapes.RECTANGLE, { x: 6.1, y: 1.05, w: 3.6, h: 4.15,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 6.1, y: 1.05, w: 3.6, h: 0.06, fill: { color: C.neonGreen } });
    s.addText("Lỗ Hổng Mục Tiêu & Biện Pháp", { x: 6.2, y: 1.13, w: 3.2, h: 0.38, fontSize: 13, bold: true, color: C.neonGreen, margin: 0 });
    s.addImage({ data: iconBug, x: 9.25, y: 1.1, w: 0.4, h: 0.4 });

    const vulnItems = [
      ["SQL / NoSQL Injection", "Joi validation mọi endpoint + fuzz TC-FUZZ-05→09 + MongoDB driver parameterized — không dùng raw SQL", C.neonGreen],
      ["XSS", "API trả JSON (không HTML); passive TC-SEC-PASSIVE-07. XSS chủ yếu ở frontend — cần ZAP quét Web", C.neonBlue],
      ["CSRF", "Cookie HttpOnly + JWT; CORS cấu hình config/cors. Chưa có test CSRF token riêng — active ZAP có thể bổ sung", C.neonPurple],
      ["A01 Broken Access Control", "Integration: auth cookie/JWT, invitation khi chưa đăng nhập → 401 — bổ trợ thêm, ngoài suite passive", C.neonYellow],
    ];
    vulnItems.forEach(([k, v, color], i) => {
      const y = 1.6 + i * 0.92;
      s.addShape(pres.shapes.RECTANGLE, { x: 6.15, y, w: 3.5, h: 0.84, fill: { color: C.navy } });
      s.addShape(pres.shapes.RECTANGLE, { x: 6.15, y, w: 0.05, h: 0.84, fill: { color } });
      s.addText(k, { x: 6.25, y: y + 0.06, w: 3.35, h: 0.26, fontSize: 10.5, bold: true, color, margin: 0 });
      s.addText(v, { x: 6.25, y: y + 0.32, w: 3.35, h: 0.48, fontSize: 9, color: C.lightGray, margin: 0, wrap: true });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 13 — ĐÁNH GIÁ TỔNG HỢP
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonBlue } });

    s.addText("ĐÁNH GIÁ TỔNG HỢP", { x: 0.3, y: 0.25, w: 7, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonBlue } });

    const kpis = [
      ["162/162", "API Tests PASS", C.neonGreen],
      ["31/31", "Web Component PASS", C.neonGreen],
      ["100%", "Coverage utils/validation", C.neonBlue],
      ["97.92%", "Mutation Score", C.neonYellow],
      ["9/9", "Fuzz Properties PASS", C.neonGreen],
      ["13", "E2E Scenarios PASS", C.neonPurple],
    ];

    kpis.forEach(([val, label, color], i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.3 + col * 3.2;
      const y = 0.95 + row * 1.15;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 3.0, h: 1.0,
        fill: { color: C.bgCard },
        shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.25 }
      });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 3.0, h: 0.05, fill: { color } });
      s.addText(val, { x, y: y + 0.08, w: 3.0, h: 0.55, fontSize: 32, bold: true, color, align: "center", margin: 0 });
      s.addText(label, { x, y: y + 0.65, w: 3.0, h: 0.28, fontSize: 10, color: C.midGray, align: "center", margin: 0 });
    });

    // Ưu điểm & Hạn chế
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.3, w: 4.5, h: 2.0,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.3, w: 4.5, h: 0.06, fill: { color: C.neonGreen } });
    s.addText("✓  Ưu Điểm", { x: 0.45, y: 3.38, w: 4.2, h: 0.38, fontSize: 13, bold: true, color: C.neonGreen, margin: 0 });

    const pros = [
      "createApp() + Supertest + MongoDB in-memory",
      "Traceability: TC-BB-*, TC-INT-*, TC-E2E-* trong mã",
      "POM Selenium + data-testid bảo trì được",
      "Mutation 97.92% — unit test chất lượng cao",
      "CI sẵn sàng: lint → Jest → fuzz → coverage",
    ];
    pros.forEach((p, i) => {
      s.addText([
        { text: "▸ ", options: { color: C.neonGreen } },
        { text: p, options: { color: C.lightGray } }
      ], { x: 0.4, y: 3.82 + i * 0.38, w: 4.25, h: 0.35, fontSize: 10.5, margin: 0 });
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 3.3, w: 4.5, h: 2.0,
      fill: { color: C.bgCard },
      shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.3 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 3.3, w: 4.5, h: 0.06, fill: { color: C.neonYellow } });
    s.addText("⚠  Hạn Chế", { x: 5.35, y: 3.38, w: 4.2, h: 0.38, fontSize: 13, bold: true, color: C.neonYellow, margin: 0 });

    const cons = [
      "Selenium flaky khi MUI Zoom animation",
      "RTL mock Redux/API — không bắt lỗi tích hợp thật",
      "Fuzz trên utils + Joi validation — chưa fuzz HTTP body",
      "Selenium chưa tích hợp GitHub Actions CI",
      "Coverage cao ≠ không còn lỗi nghiệp vụ",
    ];
    cons.forEach((c, i) => {
      s.addText([
        { text: "▸ ", options: { color: C.neonYellow } },
        { text: c, options: { color: C.lightGray } }
      ], { x: 5.3, y: 3.82 + i * 0.38, w: 4.25, h: 0.35, fontSize: 10.5, margin: 0 });
    });
  }

  // SLIDE 14 — HƯỚNG PHÁT TRIỂN
  {
    let s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonPurple } });

    s.addText("HƯỚNG PHÁT TRIỂN", { x: 0.3, y: 0.25, w: 7, h: 0.5, fontSize: 26, bold: true, color: C.white, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.77, w: 2, h: 0.04, fill: { color: C.neonPurple } });

    const roadmap = [
      { icon: iconTools, title: "CI/CD Integration", desc: "Gắn Selenium vào GitHub Actions CI với Chrome headless + docker-compose. Pipeline lint → test → coverage tự động.", color: C.neonBlue },
      { icon: iconShield, title: "Contract Test (Pact)", desc: "Triển khai Pact contract test giữa Trello-web (consumer) và trello-api (provider) — đảm bảo API không breaking change.", color: C.neonGreen },
      { icon: iconFlask, title: "Fuzz API Body (HTTP)", desc: "Mở rộng fuzz body HTTP register/login kết hợp Supertest + fast-check — kiểm tra robustness ở tầng API.", color: C.neonPurple },
      { icon: iconChart, title: "Performance Test (k6)", desc: "Kiểm thử hiệu năng GET /boards với k6 — đo throughput, latency, response time dưới tải cao.", color: C.neonYellow },
      { icon: iconCog, title: "Mutation mở rộng", desc: "Mở rộng mutation testing sang authMiddleware và toàn bộ Joi validation — tăng mutation score coverage diện rộng.", color: C.neonBlue },
      { icon: iconBug, title: "Security Test (ZAP)", desc: "Tích hợp OWASP ZAP để passive + active security scanning — phát hiện CSRF, XSS, SQL injection tiềm ẩn.", color: C.neonGreen },
    ];

    roadmap.forEach(({ icon, title, desc, color }, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.3 + col * 4.8;
      const y = 1.0 + row * 1.5;

      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.5, h: 1.3,
        fill: { color: C.bgCard },
        shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.25 }
      });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.3, fill: { color } });
      s.addImage({ data: icon, x: x + 0.12, y: y + 0.1, w: 0.45, h: 0.45 });
      s.addText(title, { x: x + 0.65, y: y + 0.1, w: 3.75, h: 0.38, fontSize: 13, bold: true, color, margin: 0 });
      s.addText(desc, { x: x + 0.12, y: y + 0.58, w: 4.25, h: 0.65, fontSize: 10, color: C.lightGray, margin: 0, wrap: true });
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE 15 — THANK YOU / KẾT LUẬN
  // ─────────────────────────────────────────────────────────────
  {
    let s = pres.addSlide();
    s.background = { color: C.bgSlide };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.neonBlue } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.585, w: 10, h: 0.04, fill: { color: C.neonBlue } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonBlue } });
    s.addShape(pres.shapes.RECTANGLE, { x: 9.94, y: 0, w: 0.06, h: 5.625, fill: { color: C.neonBlue } });

    // Decorative dots
    for (let i = 0; i < 12; i++) {
      s.addShape(pres.shapes.OVAL, {
        x: 1.5 + i * 0.65, y: 0.8,
        w: 0.05, h: 0.05,
        fill: { color: C.neonBlue, transparency: 60 },
        line: { color: C.neonBlue, transparency: 60, width: 0 }
      });
    }

    s.addText("CẢM ƠN", { x: 1, y: 1.1, w: 8, h: 1.2, fontSize: 80, bold: true, color: C.neonBlue, align: "center", margin: 0 });
    s.addText("QUÝ THẦY & CÁC BẠN ĐÃ LẮNG NGHE", { x: 1, y: 2.3, w: 8, h: 0.5, fontSize: 16, color: C.lightGray, align: "center", charSpacing: 2, margin: 0 });

    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 2.88, w: 3, h: 0.04, fill: { color: C.neonGreen } });

    // Summary stats
    const summaryStats = [
      ["162", "Tests PASS", C.neonGreen],
      ["97.92%", "Mutation", C.neonYellow],
      ["100%", "Coverage", C.neonBlue],
      ["13", "E2E Runs", C.neonPurple],
    ];
    summaryStats.forEach(([v, l, c], i) => {
      s.addText(v, { x: 0.8 + i * 2.15, y: 3.05, w: 2.0, h: 0.55, fontSize: 28, bold: true, color: c, align: "center", margin: 0 });
      s.addText(l, { x: 0.8 + i * 2.15, y: 3.6, w: 2.0, h: 0.28, fontSize: 10, color: C.midGray, align: "center", margin: 0 });
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.98, w: 3, h: 0.04, fill: { color: C.neonGreen } });

    s.addText("Đề tài: Kiểm Thử Phần Mềm Trello", { x: 1, y: 4.15, w: 8, h: 0.3, fontSize: 12, color: C.midGray, align: "center", margin: 0 });
    s.addText("ĐH Phenikaa — Trường CNTT — Khoá K17 — Tháng 06/2026", { x: 1, y: 4.45, w: 8, h: 0.3, fontSize: 11, color: C.midGray, align: "center", margin: 0 });

    s.addImage({ data: iconCheck, x: 4.75, y: 0.1, w: 0.5, h: 0.6 });
  }

  await pres.writeFile({ fileName: "KiemThu_Trello_Presentation.pptx" });
  console.log("Done!");
}

main().catch(console.error);