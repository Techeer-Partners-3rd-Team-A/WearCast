import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { dfs_xy_conv } from "./ConvertLocation.tsx";

async function get_location(address: string) {
  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${address}`;
  const headers = {
    Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_API_KEY}`,
  };

  try {
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const api_json = response.data;
      return api_json;
    } else {
      console.error("HTTP 오류: " + response.status);
      return null;
    }
  } catch (error) {
    console.error("네트워크 오류:", error);
    return null;
  }
}

async function get_weather(x: number, y: number) {
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

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);

  const fetchWeatherData = async () => {
    const locationRes = await get_location("경기도 수원시");
    let x = dfs_xy_conv(
      "toXY",
      locationRes.documents[0].y,
      locationRes.documents[0].x
    ).x;
    let y = dfs_xy_conv(
      "toXY",
      locationRes.documents[0].y,
      locationRes.documents[0].x
    ).y;
    const weatherRes = await get_weather(x, y);
    setCurrentWeather(weatherRes);
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const [currentTemperature, setCurrentTemperature] = useState(null);
  const [currentSky, setCurrentSky] = useState("");
  const [currentPrecipitationType, setCurrentPrecipitationType] = useState("");
  const [currentPrecipitationProbability, setCurrentPrecipitationProbability] =
    useState(null);
  const [currentPrecipitationAmount, setCurrentPrecipitationAmount] =
    useState("");
  const [currentHumidity, setCurrentHumidity] = useState(null);

  useEffect(() => {
    if (currentWeather) {
      console.log(currentWeather);
      // 0: 1시간 기온(TMP)
      setCurrentTemperature(
        currentWeather.response.body.items.item[0].fcstValue
      );

      // 5: 하늘상태(SKY) -> switch문으로 처리
      switch (currentWeather.response.body.items.item[5].fcstValue) {
        case "1":
          setCurrentSky("맑고");
          break;
        case "3":
          setCurrentSky("구름 많고");
          break;
        case "4":
          setCurrentSky("흐리고");
          break;
      }

      // 6: 강수형태(PTY) -> switch문으로 처리
      switch (currentWeather.response.body.items.item[6].fcstValue) {
        case "0":
          setCurrentPrecipitationType("비가 내리지 않음");
          break;
        case "1":
          setCurrentPrecipitationType("비가 내림");
          break;
        case "2":
          setCurrentPrecipitationType("비/눈이 내림");
          break;
        case "3":
          setCurrentPrecipitationType("눈이 내림");
          break;
        case "4":
          setCurrentPrecipitationType("소나기가 내림");
          break;
      }

      // 7: 강수확률(POP)
      setCurrentPrecipitationProbability(
        currentWeather.response.body.items.item[7].fcstValue
      );

      // 9: 1시간 강수량(PCP)
      if (currentWeather.response.body.items.item[9].fcstValue === "강수없음") {
        setCurrentPrecipitationAmount("0");
      } else {
        setCurrentPrecipitationAmount(
          currentWeather.response.body.items.item[9].fcstValue
        );
      }

      // 10: 습도(REH)
      setCurrentHumidity(currentWeather.response.body.items.item[10].fcstValue);
    }
  }, [currentWeather]);

  return (
    <>
      <p>오늘 온도: {currentTemperature}도</p>
      <p>
        오늘 날씨: {currentSky}, {currentPrecipitationType}
      </p>
      <p>오늘 강수확률: {currentPrecipitationProbability}%</p>
      <p>오늘 강수량: {currentPrecipitationAmount}mm</p>
      <p>오늘 습도: {currentHumidity}%</p>
    </>
  );
}

export default App;
