// utils/network-detector.ts
export const networkMapping = {
  mtn: [
    "0803",
    "0806",
    "0703",
    "0903",
    "0706",
    "0813",
    "0810",
    "0814",
    "0816",
    "0906",
    "07025",
    "07026",
    "0704",
  ],
  airtel: [
    "0802",
    "0808",
    "0701",
    "0708",
    "0812",
    "0902",
    "0901",
    "0904",
    "0907",
    "0912",
  ],
  glo: ["0805", "0807", "0705", "0815", "0905", "0811", "0915"],
  "9mobile": ["0809", "0909", "0817", "0818", "0908"],
};

export const detectNetwork = (phone: string) => {
  // Clean the number (remove spaces/country code)
  let num = phone.replace(/\s+/g, "");
  if (num.startsWith("+234")) num = "0" + num.slice(4);
  if (num.startsWith("234")) num = "0" + num.slice(3);

  for (const [provider, prefixes] of Object.entries(networkMapping)) {
    if (prefixes.some((prefix) => num.startsWith(prefix))) {
      return provider;
    }
  }
  return null;
};
