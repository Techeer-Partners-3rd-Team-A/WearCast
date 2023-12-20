import axios from "axios";

export default async function get_weather(x: number, y: number) {
  const currentDate = new Date();

  // 년, 월, 일을 가져오기
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // 1자리 월 앞에 0을 붙입니다.
  const day = currentDate.getDate().toString().padStart(2, "0"); // 1자리 일 앞에 0을 붙입니다.

  // 요청할 URL 설정
  const apiUrl =
    "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

  // 요청 파라미터 설정
  const params = {
    ServiceKey: import.meta.env.VITE_KMA_API_KEY,
    pageNo: 1,
    numOfRows: 12,
    base_date: `${year}${month}${day}`,
    base_time: "0500",
    nx: x,
    ny: y,
    dataType: "JSON",
  };

  // Axios를 사용하여 GET 요청 보내기
  try {
    const response = await axios.get(apiUrl, { params });
    console.log("응답 데이터:", response.data);
    return response.data;
  } catch (error) {
    console.error("에러 발생:", error);
    return null;
  }
}
