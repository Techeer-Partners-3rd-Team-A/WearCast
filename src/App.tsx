import { SetStateAction, useEffect, useState } from "react";
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
  const [inputValue, setInputValue] = useState("경기도 안양시 만안구 안양8동");

  const fetchWeatherData = async (location: string) => {
    const locationRes = await get_location(location);
    console.log(locationRes);
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
    console.log(x, y);
    let weatherRes;
    if (x && y) {
      weatherRes = await get_weather(x, y);
    }
    setCurrentWeather(weatherRes);
  };

  const [currentTemperature, setCurrentTemperature] = useState(null);
  const [currentSky, setCurrentSky] = useState("");
  const [currentPrecipitationType, setCurrentPrecipitationType] = useState("");
  const [currentPrecipitationProbability, setCurrentPrecipitationProbability] =
    useState(null);
  const [currentPrecipitationAmount, setCurrentPrecipitationAmount] =
    useState("");
  const [currentHumidity, setCurrentHumidity] = useState(null);
  const [wearSuggestion, setWearSuggestion] = useState("");

  useEffect(() => {
    fetchWeatherData("경기도 안양시 만안구 안양8동");
  }, []);

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
        setCurrentPrecipitationAmount("0mm");
      } else {
        setCurrentPrecipitationAmount(
          currentWeather.response.body.items.item[9].fcstValue
        );
      }

      // 10: 습도(REH)
      setCurrentHumidity(currentWeather.response.body.items.item[10].fcstValue);
    }
  }, [currentWeather]);

  useEffect(() => {
    if (currentTemperature) {
      if (currentTemperature <= 4) {
        setWearSuggestion(
          "패딩, 두꺼운 코트, 누빔, 내복, 목도리, 장갑, 기모, 방한용품"
        );
      } else if (currentTemperature >= 5 && currentTemperature <= 8) {
        setWearSuggestion(
          "코트, 울 코트, 가죽 재킷, 플리스, 내복, 니트, 레깅스, 청바지, 두꺼운 바지, 스카프, 기모"
        );
      } else if (currentTemperature >= 9 && currentTemperature <= 11) {
        setWearSuggestion(
          "재킷, 야상, 점퍼, 트렌치 코트, 니트, 청바지, 면바지, 검은색 스타킹, 기모 바지, 레이어드"
        );
      } else if (currentTemperature >= 12 && currentTemperature <= 16) {
        setWearSuggestion(
          "재킷, 가디건, 청재킷, 야상, 니트, 스웨트 셔츠(맨투맨), 셔츠, 기모 후드티, 청바지, 면바지, 살구색 스타킹"
        );
      } else if (currentTemperature >= 17 && currentTemperature <= 19) {
        setWearSuggestion(
          "얇은 니트, 얇은 가디건, 얇은 재킷, 후드티, 스웨트 셔츠(맨투맨), 바람막이, 가디건, 긴바지, 청바지, 슬랙스, 스키니진"
        );
      } else if (currentTemperature >= 20 && currentTemperature <= 22) {
        setWearSuggestion(
          "얇은 가디건, 긴팔 티셔츠, 셔츠, 블라우스, 후드티, 면바지, 슬랙스, 7부 바지, 청바지"
        );
      } else if (currentTemperature >= 23 && currentTemperature <= 27) {
        setWearSuggestion(
          "반팔 티셔츠, 얇은 셔츠, 얇은 긴팔 티셔츠, 반바지, 면바지"
        );
      } else if (currentTemperature >= 28) {
        setWearSuggestion(
          "민소매, 반팔 티셔츠, 반바지(핫팬츠), 민소매 원피스, 짧은 치마, 린넨"
        );
      }
    }
  }, [currentTemperature]);

  const handleInputChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    const newValue = event.target.value;
    setInputValue(newValue);
  };

  return (
    <>
      <p>오늘 온도: {currentTemperature}도</p>
      <p>
        오늘 날씨: {currentSky}, {currentPrecipitationType}
      </p>
      <p>오늘 강수확률: {currentPrecipitationProbability}%</p>
      <p>오늘 강수량: {currentPrecipitationAmount}</p>
      <p>오늘 습도: {currentHumidity}%</p>
      <p>옷 추천: {wearSuggestion}</p>
      <input type="text" value={inputValue} onChange={handleInputChange} />
      <br />
      <br />
      <button onClick={() => fetchWeatherData(inputValue)}>날씨 보기</button>
    </>
  );
}

export default App;
