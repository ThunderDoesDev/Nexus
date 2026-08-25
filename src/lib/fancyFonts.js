/**
 * Map ASCII letters/digits through a Unicode "font" style.
 * Styles use Mathematical Alphanumeric Symbols where available.
 */

function mapChars(text, table) {
  return String(text ?? "")
    .split("")
    .map((ch) => table[ch] ?? table[ch.toLowerCase()] ?? table[ch.toUpperCase()] ?? ch)
    .join("");
}

function buildAlpha(upperStart, lowerStart, digitStart = null) {
  const table = {};
  for (let i = 0; i < 26; i++) {
    table[String.fromCharCode(65 + i)] = String.fromCodePoint(upperStart + i);
    table[String.fromCharCode(97 + i)] = String.fromCodePoint(lowerStart + i);
  }
  if (digitStart != null) {
    for (let i = 0; i < 10; i++) {
      table[String(i)] = String.fromCodePoint(digitStart + i);
    }
  }
  return table;
}

const STYLES = [
  {
    id: "bold",
    label: "Bold",
    transform: (t) => mapChars(t, buildAlpha(0x1d400, 0x1d41a, 0x1d7ce)),
  },
  {
    id: "italic",
    label: "Italic",
    transform: (t) => mapChars(t, buildAlpha(0x1d434, 0x1d44e)),
  },
  {
    id: "bold-italic",
    label: "Bold Italic",
    transform: (t) => mapChars(t, buildAlpha(0x1d468, 0x1d482)),
  },
  {
    id: "script",
    label: "Script",
    transform: (t) => mapChars(t, buildAlpha(0x1d49c, 0x1d4b6)),
  },
  {
    id: "bold-script",
    label: "Bold Script",
    transform: (t) => mapChars(t, buildAlpha(0x1d4d0, 0x1d4ea)),
  },
  {
    id: "fraktur",
    label: "Fraktur",
    transform: (t) => mapChars(t, buildAlpha(0x1d504, 0x1d51e)),
  },
  {
    id: "double",
    label: "Double Struck",
    transform: (t) => mapChars(t, buildAlpha(0x1d538, 0x1d552, 0x1d7d8)),
  },
  {
    id: "sans",
    label: "Sans",
    transform: (t) => mapChars(t, buildAlpha(0x1d5a0, 0x1d5ba, 0x1d7e2)),
  },
  {
    id: "sans-bold",
    label: "Sans Bold",
    transform: (t) => mapChars(t, buildAlpha(0x1d5d4, 0x1d5ee, 0x1d7ec)),
  },
  {
    id: "monospace",
    label: "Monospace",
    transform: (t) => mapChars(t, buildAlpha(0x1d670, 0x1d68a, 0x1d7f6)),
  },
  {
    id: "small-caps",
    label: "Small Caps",
    transform: (t) =>
      mapChars(t, {
        a: "ᴀ",
        b: "ʙ",
        c: "ᴄ",
        d: "ᴅ",
        e: "ᴇ",
        f: "ꜰ",
        g: "ɢ",
        h: "ʜ",
        i: "ɪ",
        j: "ᴊ",
        k: "ᴋ",
        l: "ʟ",
        m: "ᴍ",
        n: "ɴ",
        o: "ᴏ",
        p: "ᴘ",
        q: "ǫ",
        r: "ʀ",
        s: "ꜱ",
        t: "ᴛ",
        u: "ᴜ",
        v: "ᴠ",
        w: "ᴡ",
        x: "x",
        y: "ʏ",
        z: "ᴢ",
      }),
  },
  {
    id: "fullwidth",
    label: "Fullwidth",
    transform: (t) =>
      String(t ?? "")
        .split("")
        .map((ch) => {
          const code = ch.charCodeAt(0);
          if (code === 32) return "\u3000";
          if (code >= 33 && code <= 126) return String.fromCharCode(code + 0xfee0);
          return ch;
        })
        .join(""),
  },
  {
    id: "bubble",
    label: "Bubbles",
    transform: (t) =>
      mapChars(t, {
        A: "Ⓐ",
        B: "Ⓑ",
        C: "Ⓒ",
        D: "Ⓓ",
        E: "Ⓔ",
        F: "Ⓕ",
        G: "Ⓖ",
        H: "Ⓗ",
        I: "Ⓘ",
        J: "Ⓙ",
        K: "Ⓚ",
        L: "Ⓛ",
        M: "Ⓜ",
        N: "Ⓝ",
        O: "Ⓞ",
        P: "Ⓟ",
        Q: "Ⓠ",
        R: "Ⓡ",
        S: "Ⓢ",
        T: "Ⓣ",
        U: "Ⓤ",
        V: "Ⓥ",
        W: "Ⓦ",
        X: "Ⓧ",
        Y: "Ⓨ",
        Z: "Ⓩ",
        a: "ⓐ",
        b: "ⓑ",
        c: "ⓒ",
        d: "ⓓ",
        e: "ⓔ",
        f: "ⓕ",
        g: "ⓖ",
        h: "ⓗ",
        i: "ⓘ",
        j: "ⓙ",
        k: "ⓚ",
        l: "ⓛ",
        m: "ⓜ",
        n: "ⓝ",
        o: "ⓞ",
        p: "ⓟ",
        q: "ⓠ",
        r: "ⓡ",
        s: "ⓢ",
        t: "ⓣ",
        u: "ⓤ",
        v: "ⓥ",
        w: "ⓦ",
        x: "ⓧ",
        y: "ⓨ",
        z: "ⓩ",
        0: "⓪",
        1: "①",
        2: "②",
        3: "③",
        4: "④",
        5: "⑤",
        6: "⑥",
        7: "⑦",
        8: "⑧",
        9: "⑨",
      }),
  },
  {
    id: "squared",
    label: "Squared",
    transform: (t) =>
      mapChars(t, {
        A: "🄰",
        B: "🄱",
        C: "🄲",
        D: "🄳",
        E: "🄴",
        F: "🄵",
        G: "🄶",
        H: "🄷",
        I: "🄸",
        J: "🄹",
        K: "🄺",
        L: "🄻",
        M: "🄼",
        N: "🄽",
        O: "🄾",
        P: "🄿",
        Q: "🅀",
        R: "🅁",
        S: "🅂",
        T: "🅃",
        U: "🅄",
        V: "🅅",
        W: "🅆",
        X: "🅇",
        Y: "🅈",
        Z: "🅉",
      }),
  },
  {
    id: "upside-down",
    label: "Upside Down",
    transform: (t) => {
      const flip = {
        a: "ɐ",
        b: "q",
        c: "ɔ",
        d: "p",
        e: "ǝ",
        f: "ɟ",
        g: "ƃ",
        h: "ɥ",
        i: "ᴉ",
        j: "ɾ",
        k: "ʞ",
        l: "l",
        m: "ɯ",
        n: "u",
        o: "o",
        p: "d",
        q: "b",
        r: "ɹ",
        s: "s",
        t: "ʇ",
        u: "n",
        v: "ʌ",
        w: "ʍ",
        x: "x",
        y: "ʎ",
        z: "z",
        A: "∀",
        B: "𐐒",
        C: "Ɔ",
        D: "◖",
        E: "Ǝ",
        F: "Ⅎ",
        G: "⅁",
        H: "H",
        I: "I",
        J: "ſ",
        K: "⋊",
        L: "˥",
        M: "W",
        N: "N",
        O: "O",
        P: "Ԁ",
        Q: "Ό",
        R: "ᴚ",
        S: "S",
        T: "⊥",
        U: "∩",
        V: "Λ",
        W: "M",
        X: "X",
        Y: "⅄",
        Z: "Z",
        0: "0",
        1: "Ɩ",
        2: "ᄅ",
        3: "Ɛ",
        4: "ㄣ",
        5: "ϛ",
        6: "9",
        7: "ㄥ",
        8: "8",
        9: "6",
        ".": "˙",
        ",": "'",
        "?": "¿",
        "!": "¡",
        "'": ",",
        '"': "„",
        "(": ")",
        ")": "(",
        "[": "]",
        "]": "[",
        "{": "}",
        "}": "{",
        "<": ">",
        ">": "<",
        "&": "⅋",
        _: "‾",
      };
      return String(t ?? "")
        .split("")
        .map((ch) => flip[ch] ?? ch)
        .reverse()
        .join("");
    },
  },
  {
    id: "zalgo",
    label: "Zalgo",
    transform: (t) => {
      const marks = [
        "\u0300",
        "\u0301",
        "\u0302",
        "\u0303",
        "\u0304",
        "\u0306",
        "\u0307",
        "\u0308",
        "\u030a",
        "\u030b",
        "\u030c",
        "\u0310",
        "\u0312",
        "\u0315",
        "\u031a",
        "\u031b",
        "\u033d",
        "\u033e",
        "\u033f",
        "\u0342",
        "\u034a",
        "\u034b",
        "\u0350",
        "\u0351",
        "\u0352",
        "\u0357",
        "\u035b",
        "\u0363",
        "\u0364",
        "\u0365",
      ];
      return String(t ?? "")
        .split("")
        .map((ch) => {
          if (ch === " " || ch === "\n") return ch;
          let out = ch;
          const count = 2 + Math.floor(Math.random() * 4);
          for (let i = 0; i < count; i++) {
            out += marks[Math.floor(Math.random() * marks.length)];
          }
          return out;
        })
        .join("");
    },
  },
];

export const FONT_STYLES = STYLES;

export function applyFontStyle(styleId, text) {
  const style = STYLES.find((s) => s.id === styleId);
  if (!style) return String(text ?? "");
  return style.transform(text);
}

export function applyAllFontStyles(text) {
  return STYLES.map((style) => ({
    id: style.id,
    label: style.label,
    value: style.transform(text),
  }));
}
