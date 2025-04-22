const uuid4 = require("uuid4");

exports.getUuidKey = () => {
  const tokens = uuid4().split("-");
  return tokens[2] + tokens[1] + tokens[0] + tokens[3];
};

exports.getIp = (req) => {
  const cfIp = req.headers["cf-connecting-ip"];
  if (cfIp) {
    return sanitize(cfIp);
  }

  // 2) 후보 IP들 수집
  const rawSources = [
    req.headers["x-real-ip"],
    req.headers["x-forwarded-for"],
    req.connection?.remoteAddress,
    req.socket?.remoteAddress,
    req.ip, // express 쓰는 경우
  ];

  // 3) “콤마로 구분된” 여러 IP → 풀어서, 공백·IPv6 매핑 제거
  const ips = rawSources
    .filter(Boolean)
    .flatMap((src) => src.split(","))
    .map((ip) => sanitize(ip))
    .filter(Boolean);

  if (ips.length === 0) {
    return null;
  }

  // 4) 가장 많이 나온 IP 계산
  const counts = ips.reduce((acc, ip) => {
    acc[ip] = (acc[ip] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};

const sanitize = (ip) => {
  const t = ip.trim();
  return t.startsWith("::ffff:") ? t.slice(7) : t;
};
