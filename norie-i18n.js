export const DEFAULT_LOCALE = "en";
export const STORAGE_KEY = "norie.locale";

const pairs = {
  "nav.home": ["Homepage", "首页"],
  "nav.shop": ["Shop", "选购"],
  "nav.customize": ["Customize", "定制"],
  "nav.lookbooks": ["LOOKBOOKS", "造型图集"],
  "nav.custom": ["Custom", "专属定制"],
  "nav.contact": ["Contact", "联系我们"],
  "nav.instagram": ["Instagram soon", "Instagram 即将上线"],
  "common.orderLabel": ["Email Norie to place a custom order", "邮件联系 Norie 定制"],
  "common.language": ["Language", "语言"],
  "common.backHome": ["Back to home", "返回首页"],
  "common.socialAccounts": ["Social accounts", "社交媒体账号"],
  "common.opensNewTab": ["— opens in a new tab", "— 在新标签页打开"],
  "cart.title": ["Your cart", "购物车"],
  "cart.empty": ["Your cart is empty.", "购物车还是空的。"],
  "cart.shop": ["Continue shopping", "继续选购"],
  "cart.total": ["Total", "合计"],
  "cart.remove": ["Remove", "删除"],
  "checkout.title": ["Checkout", "确认订单"],
  "checkout.name": ["Name", "姓名"],
  "checkout.email": ["Email", "邮箱"],
  "checkout.contact": ["Phone or WeChat", "电话或微信"],
  "checkout.submit": ["Confirm order", "确认订单"],
  "checkout.pending": ["Sending your order…", "正在提交订单……"],
  "checkout.success": ["Order confirmed · Payment pending", "订单已确认 · 待付款"],
  "checkout.failure": ["We could not send your order. Your cart is saved; please try again.", "订单暂时无法发送。购物车已保留，请重试。"],
  "shop.plumeria.copy": ["One large and two small Plumeria claw clips in your selected color.", "一只大号与两只小号鸡蛋花抓夹，任选粉色或白色。"],
  "shop.plumeria.color": ["Color", "颜色"],
  "home.title": ["Norie | Custom Crystal Hair Pieces", "Norie｜专属水晶发饰"],
  "home.hero.title": ["Custom Hair Pieces", "属于你的闪闪发光"],
  "home.hero.shop": ["Shop", "去逛逛"],
  "home.hero.customize": ["Customize yours", "定制你的专属款"],
  "home.pink.title": ["Pink pieces for everyday shine", "今天也要粉得刚刚好"],
  "home.pink.copy": ["Soft blush combs and claw clips for morning routines, cafe tables, vanity trays, and what-is-in-my-bag photos.", "柔雾粉梳子与抓夹，把日常也变成值得记录的一刻。"],
  "home.pink.shop": ["Shop pink", "选购粉色系列"],
  "home.white.title": ["White pieces for clean routines", "干净感，从一把白色梳子开始"],
  "home.white.copy": ["Pearl white combs and claw clips for bathroom counters, bridal edits, clean-girl bags, and silver crystal lettering.", "珍珠白梳子与抓夹，清透、精致，刚刚好的高级感。"],
  "home.white.shop": ["Shop white", "选购白色系列"],
  "home.lookbooks.title": ["LOOKBOOKS", "造型图集"],
  "home.sets.title": ["Comb and Clip Set", "梳子 × 抓夹限定套装"],
  "home.sets.subtitle": ["First month limited edition.", "首月限定，售完即止。"],
  "home.set1.badge": ["Set 1", "套装 01"],
  "home.set1.title": ["Bamboo Paddle Brush + Claw Clip", "Bamboo Paddle Brush + Claw Clip"],
  "home.set1.copy": ["A limited-edition bamboo paddle brush and claw clip pairing with one free gift.", "竹制气垫梳搭配抓夹，再随机送你一份小礼物。"],
  "home.set2.badge": ["Set 2", "套装 02"],
  "home.set2.title": ["Flat Brush + Claw Clip", "Flat Brush + Claw Clip"],
  "home.set2.copy": ["A limited-edition flat brush and claw clip pairing with one free gift.", "Flat Brush 搭配抓夹，再随机送你一份小礼物。"],
  "home.details.title": ["Custom details", "每一处，都由你决定"],
  "home.details.copy": ["Pick the base, the wording, the color story, and the lettering style for your custom piece.", "从款式、文字到水钻颜色，把它做成只属于你的样子。"],
  "home.choose1": ["Choose 01", "选择 01"],
  "home.choose2": ["Choose 02", "选择 02"],
  "home.choose3": ["Choose 03", "选择 03"],
  "home.choose4": ["Choose 04", "选择 04"],
  "home.product": ["Product", "款式"],
  "home.productCopy": ["Pick a comb or a claw clip as the base for your custom design.", "选择梳子或抓夹，开启你的专属设计。"],
  "home.text": ["Text", "文字"],
  "home.textCopy": ["Add one initial, a short name, or a tiny word across the piece.", "加上首字母、名字，或一句只属于你的短词。"],
  "home.color": ["Color", "颜色"],
  "home.colorCopy": ["Choose the rhinestone color: pink, white, red, or pearl.", "选择粉、白、红或珍珠色水钻。"],
  "home.font": ["Font", "字体"],
  "home.fontCopy": ["Pick a lettering style: clean script, bubble, classic, or bold.", "简约手写、泡泡字、经典或加粗，选你喜欢的风格。"],
  "home.mood.title": ["Shop by mood", "按心情选一款"],
  "home.mood.copy": ["Color-story edits for custom sets, birthday boxes, and photo-ready launch drops.", "为日常、生日礼盒和每一次出片时刻配好颜色。"],
  "home.pinky": ["Pinky Promise", "Pinky Promise"],
  "home.pinky.copy": ["Baby pink clips, silver sparkles, and bestie energy.", "奶油粉、银色闪光，还有最适合送闺蜜的氛围感。"],
  "home.pearl": ["Pearl Crush", "Pearl Crush"],
  "home.pearl.copy": ["Glossy blush packaging with names, hearts, and soft shine.", "柔光包装，加上名字与爱心，精致得刚刚好。"],
  "home.cherry": ["Cherry Vanilla", "Cherry Vanilla"],
  "home.cherry.copy": ["Cream bases with berry-red rhinestones for a glam edit.", "奶油底色碰上莓果红水钻，甜里带一点酷。"],
  "home.bluebell": ["Bluebell Baby", "Bluebell Baby"],
  "home.bluebell.copy": ["Sky blue ribbons, gingham textures, and clean white boxes.", "天空蓝丝带、格纹与纯白礼盒，清新得很上镜。"],
  "home.follow": ["Follow Norie for new samples, custom-order updates, and launch news.", "关注 Norie，第一时间解锁新品、定制灵感与上新消息。"],
  "shop.title": ["Shop | Norie Custom Hair Pieces", "选购｜Norie 专属发饰"],
  "shop.hero": ["Shop All", "全部好物"],
  "shop.hero.copy": ["shop all Norie custom combs, acetate claw clips, and launch gift sets in pink and white.", "从专属梳子、醋酸抓夹到限定礼盒，粉色与白色都在这里。"],
  "shop.products.copy": ["Explore limited-edition sets and individual pieces, then customize your selection.", "挑一套限定组合，或从单品开始定制你的专属款。"],
  "shop.build": ["Build this set", "定制这套组合"],
  "shop.customizePiece": ["Customize this piece", "定制这件单品"],
  "shop.large": ["Bamboo Paddle Brush", "Bamboo Paddle Brush"],
  "shop.small": ["Flat Brush", "Flat Brush"],
  "shop.clip": ["Claw Clip", "Claw Clip"],
  "shop.essentials": ["Essentials Hairstyling Set", "Essentials Hairstyling Set"],
  "shop.baby": ["Baby Hairstyling Set", "Baby Hairstyling Set"],
  "shop.largePink": ["Pink Bamboo Paddle Brush", "Pink Bamboo Paddle Brush"],
  "shop.largeWhite": ["White Bamboo Paddle Brush", "White Bamboo Paddle Brush"],
  "shop.smallPink": ["Pink Flat Brush", "Pink Flat Brush"],
  "shop.smallWhite": ["White Flat Brush", "White Flat Brush"],
  "shop.largePinkCopy": ["Soft pink paddle comb base for longer names or bolder script.", "柔雾粉大板梳，名字再长也能漂亮装下。"],
  "shop.largeWhiteCopy": ["Pearl white paddle comb base for silver, pink, or clear stones.", "珍珠白大板梳，搭配银色、粉色或透明水钻都很出片。"],
  "shop.smallPinkCopy": ["Mini oval brush size for initials, short names, and bag photos.", "小巧随身，最适合首字母、短名字和包包合照。"],
  "shop.smallWhiteCopy": ["Compact pearl white comb for clean, delicate lettering.", "小巧珍珠白，搭配精致字母，干净又耐看。"],
  "shop.pinkClipCopy": ["Glossy pink claw clip for bow accents or tiny crystal details.", "亮泽粉色抓夹，蝴蝶结与细闪水钻都很合拍。"],
  "shop.whiteClipCopy": ["Pearl white claw clip with a polished, bridal-style base.", "珍珠白抓夹，自带清透精致的氛围感。"],
  "custom.title": ["Customize | Norie Custom Hair Pieces", "定制｜Norie 专属发饰"],
  "custom.eyebrow": ["Choose every detail", "细节都由你决定"],
  "custom.hero": ["Customize your set", "属于你的闪闪发光"],
  "custom.hero.copy": ["Pick a real product base, choose pink or white, add flower-script rhinestone lettering, then review the launch price with a random free gift.", "选好款式与颜色，加上花体水钻名字，再收下一份随机小礼物。"],
  "custom.product": ["Product", "选择款式"],
  "custom.base": ["Base color", "底色"],
  "custom.preview": ["Product preview", "产品预览"],
  "custom.prev": ["Previous product image", "上一张产品图"],
  "custom.next": ["Next product image", "下一张产品图"],
  "custom.rhinestone": ["Rhinestone color", "水钻颜色"],
  "custom.pink": ["Pink", "Pink"],
  "custom.white": ["White", "White"],
  "custom.pinkStones": ["Pink stones", "Pink stones"],
  "custom.whiteStones": ["White stones", "White stones"],
  "custom.helper.flat": ["Mini oval brush", "迷你椭圆梳"],
  "custom.helper.paddle": ["Square paddle comb", "竹制气垫梳"],
  "custom.helper.clip": ["Glossy acetate clip", "亮面醋酸抓夹"],
  "custom.helper.pinkBase": ["Soft blush acetate", "柔雾粉醋酸材质"],
  "custom.helper.whiteBase": ["Pearl white acetate", "珍珠白醋酸材质"],
  "custom.helper.pinkStones": ["Soft pink sparkle", "柔粉闪光"],
  "custom.helper.whiteStones": ["Clear pearl shine", "通透珍珠光"],
  "custom.lettering": ["Rhinestone lettering reference", "水钻字母参考"],
  "custom.gift": ["One random free gift", "随机小礼物一份"],
  "custom.text": ["Customize your text", "写下你的专属文字"],
  "custom.textHint": ["Use one initial or a short English name, up to 8 letters.", "填写一个首字母或不超过 8 个字母的英文短名。"],
  "custom.script": ["Script lettering preview", "花体字预览"],
  "custom.price": ["Estimated price", "预计价格"],
  "custom.launch": ["Launch price", "上新限定价"],
  "custom.contact": ["Contact details", "联系信息"],
  "custom.required": ["All fields are required.", "请填写全部信息。"],
  "custom.name": ["Your name", "你的名字"],
  "custom.email": ["Email address", "邮箱地址"],
  "custom.contactLabel": ["Contact", "微信号"],
  "custom.submit": ["Request custom order", "提交定制需求"],
  "form.error.name": ["Name: enter your name.", "姓名：请输入你的名字。"],
  "form.error.email": ["Email address: enter a valid email address.", "邮箱：请输入有效的邮箱地址。"],
  "form.error.contact": ["Contact: enter your WeChat ID.", "微信号：请输入你的微信号。"],
  "form.order.pending": ["Sending your custom order request...", "正在提交你的定制需求…"],
  "form.order.success": ["Sent. We will reply by email soon.", "已提交，我们会尽快通过邮件联系你。"],
  "form.order.failure": ["Could not send right now.", "暂时无法提交，请稍后再试。"]
};

export const translations = Object.freeze({
  en: Object.freeze(Object.fromEntries(Object.entries(pairs).map(([key, value]) => [key, value[0]]))),
  "zh-CN": Object.freeze(Object.fromEntries(Object.entries(pairs).map(([key, value]) => [key, value[1]])))
});

export function normalizeLocale(value) {
  return value === "zh-CN" ? "zh-CN" : DEFAULT_LOCALE;
}

export function translate(key, locale = DEFAULT_LOCALE, fallback = key) {
  return translations[normalizeLocale(locale)][key] ?? fallback;
}

let currentLocale = DEFAULT_LOCALE;

export function getLocale() {
  if (typeof localStorage === "undefined") return currentLocale;
  try {
    currentLocale = normalizeLocale(localStorage.getItem(STORAGE_KEY));
  } catch {}
  return currentLocale;
}

function keyForValue(value) {
  return Object.keys(translations.en).find((key) =>
    translations.en[key] === value || translations["zh-CN"][key] === value
  );
}

function translateTextNodes(root, locale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest("script, style, [data-no-i18n]")) continue;
    const value = node.nodeValue.trim();
    if (!value) continue;
    const key = node.parentElement?.dataset.i18n || keyForValue(value);
    if (!key) continue;
    const next = translate(key, locale, value);
    node.nodeValue = node.nodeValue.replace(value, next);
  }
}

export function applyTranslations(root, locale) {
  const normalized = normalizeLocale(locale);
  document.documentElement.lang = normalized;
  document.title = translate(`${document.body?.dataset.page}.title`, normalized, document.title);
  translateTextNodes(root, normalized);
  for (const [attribute, selector] of [["aria-label", "[aria-label]"], ["alt", "[alt]"], ["placeholder", "[placeholder]"]]) {
    root.querySelectorAll(selector).forEach((element) => {
      const current = element.getAttribute(attribute);
      const original = element.dataset[`i18nOriginal${attribute.replace("-", "")}`] || current;
      element.dataset[`i18nOriginal${attribute.replace("-", "")}`] = original;
      const key = keyForValue(original);
      if (key) element.setAttribute(attribute, translate(key, normalized, original));
    });
  }
  root.querySelectorAll("[data-locale]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.locale === normalized));
  });
}

export function setLocale(locale, { persist = true } = {}) {
  currentLocale = normalizeLocale(locale);
  applyTranslations(document, currentLocale);
  if (persist && typeof localStorage !== "undefined") {
    try { localStorage.setItem(STORAGE_KEY, currentLocale); } catch {}
  }
  document.dispatchEvent(new CustomEvent("norie:localechange", { detail: { locale: currentLocale } }));
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.NorieI18n = Object.freeze({ getLocale, setLocale, translate: (key, fallback) => translate(key, getLocale(), fallback) });
  const initialize = () => {
    document.querySelectorAll("[data-language-switcher] [data-locale]").forEach((button) => {
      button.addEventListener("click", () => setLocale(button.dataset.locale));
    });
    setLocale(getLocale(), { persist: false });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", initialize) : initialize();
}
