import { SetStateAction, useEffect, useState } from "react";
import { AppBar, Container, Grid, Toolbar, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline"; // CssBaseline 추가
// import "./App.css";
import { dfs_xy_conv } from "./ConvertLocation.tsx";
import get_weather from "./GetWeather.tsx";
import get_location from "./GetLocation.tsx";

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
    // <>
    //   <p>오늘 온도: {currentTemperature}도</p>
    //   <p>
    //     오늘 날씨: {currentSky}, {currentPrecipitationType}
    //   </p>
    //   <p>오늘 강수확률: {currentPrecipitationProbability}%</p>
    //   <p>오늘 강수량: {currentPrecipitationAmount}</p>
    //   <p>오늘 습도: {currentHumidity}%</p>
    //   <p>옷 추천: {wearSuggestion}</p>
    //   <input type="text" value={inputValue} onChange={handleInputChange} />
    //   <br />
    //   <br />
    //   <button onClick={() => fetchWeatherData(inputValue)}>날씨 보기</button>
    // </>
    <>
      <CssBaseline /> {/* CssBaseline 추가 */}
      <Container
        disableGutters
        component="main"
        maxWidth={false}
        sx={{
          height: "100vh",
          backgroundImage: "url(https://source.unsplash.com/random?wallpapers)",
          backgroundSize: "cover",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <AppBar
          position="relative"
          style={{ background: "transparent", boxShadow: "none" }}
        >
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap>
              여기에 날짜, 시간 표시
            </Typography>
          </Toolbar>
        </AppBar>
        <Container
          sx={{
            justifyContent: "center", // 수직 가운데 정렬
            mt: "10vh",
          }}
        >
          <Container
            sx={{
              height: "40vh",
              backgroundColor: "rgba(255, 255, 255, 0.7)", // 흰색 배경에 80%의 투명도
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px", // 모서리 곡률 설정
              boxShadow: "0px 0px 7.5px 0px rgba(0,0,0,0.25)", // 그림자 추가
            }}
          >
            <Grid container>
              {/* 좌우 정렬로 왼쪽에 날씨 아이콘, 오른쪽에 텍스트 */}
              <Grid
                item
                sx={{
                  flexGrow: 1, // flexGrow를 1로 설정하여 가변폭으로 설정
                  height: "15vh",
                  width: "15vh",
                  // backgroundColor: "rgba(255, 255, 255, 0.7)", // 흰색 배경에 80%의 투명도
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pt: "2rem",
                }}
              >
                <Typography
                  component="h1"
                  variant="h2"
                  // align="center"
                  color="text.primary"
                  gutterBottom
                  sx={{
                    fontSize: "7rem",
                  }}
                >
                  🌈 {/* 날씨 표시! */}
                </Typography>
              </Grid>
              <Grid item>
                <Typography
                  component="h1"
                  variant="h2"
                  // align="center"
                  color="text.primary"
                  gutterBottom
                >
                  여기에 현재 온도, 날씨 표시
                </Typography>
                <Typography
                  variant="h5"
                  // align="center"
                  color="text.secondary"
                  paragraph
                >
                  여기에 강수확률, 강수량, 습도 표시
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Container>
        <Container
          sx={{
            justifyContent: "center", // 수직 가운데 정렬
            mt: "2.5vh",
          }}
        >
          <Container
            sx={{
              height: "30vh",
              backgroundColor: "rgba(255, 255, 255, 0.7)", // 흰색 배경에 80%의 투명도
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px", // 모서리 곡률 설정
              boxShadow: "0px 0px 7.5px 0px rgba(0,0,0,0.25)", // 그림자 추가
            }}
          >
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              좌우 정렬로 왼쪽에는 옷 아이콘, 오른쪽에는 추천 착장
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              paragraph
            >
              여기에 귀여운 멘트 입력
            </Typography>
          </Container>
        </Container>
      </Container>
    </>
  );
}

export default App;
