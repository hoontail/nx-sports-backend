exports.translateSportsName = (name) => {
  let nameKr = "";

  switch (name) {
    case "soccer":
      nameKr = "축구";
      break;
    case "americanfootball":
      nameKr = "미식축구";
      break;
    case "boxingufc":
      nameKr = "복싱/UFC";
      break;
    case "tennis":
      nameKr = "테니스";
      break;
    case "baseball":
      nameKr = "야구";
      break;
    case "icehockey":
      nameKr = "아이스하키";
      break;
    case "basketball":
      nameKr = "농구";
      break;
    case "handball":
      nameKr = "핸드볼";
      break;
    case "volleyball":
      nameKr = "배구";
      break;
    case "tabletennis":
      nameKr = "탁구";
      break;
    case "esports":
      nameKr = "E-스포츠";
      break;
  }

  return nameKr;
};
