import { SetStateAction, useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline"; // CssBaseline 추가
// import "./App.css";
import { dfs_xy_conv } from "./ConvertLocation.tsx";
import get_weather from "./GetWeather.tsx";
import get_location from "./GetLocation.tsx";
import icon_sun from "./assets/sun_2600-fe0f.png";
import icon_small_cloudy from "./assets/sun-behind-small-cloud_1f324-fe0f.png";
import icon_large_cloudy from "./assets/sun-behind-large-cloud_1f325-fe0f.png";
import icon_rain from "./assets/cloud-with-rain_1f327-fe0f.png";
import icon_snow from "./assets/cloud-with-snow_1f328-fe0f.png";
import icon_lightning from "./assets/cloud-with-lightning-and-rain_26c8-fe0f.png";
import icon_scarf from "./assets/scarf_1f9e3.png";
import icon_padding from "./assets/coat_1f9e5-2.png";
import icon_trenchcoat from "./assets/coat_1f9e5.png";
import icon_coat from "./assets/coat_1f9e5-1.png";
import icon_jeans from "./assets/jeans_1f456.png";
import icon_blouses from "./assets/womans-clothes_1f45a.png";
import icon_shorts from "./assets/shorts_1fa73.png";
import icon_shortsleeves from "./assets/t-shirt_1f455.png";
import icon_dress from "./assets/dress_1f457.png";

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [inputValue, setInputValue] = useState("경기도 안양시 만안구 안양8동");

  const currentDate = new Date();
  // 년, 월, 일을 가져오기
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // 1자리 월 앞에 0을 붙입니다.
  const day = currentDate.getDate().toString().padStart(2, "0"); // 1자리 일 앞에 0을 붙입니다.

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

  const weatherImages = [
    icon_sun,
    icon_small_cloudy,
    icon_large_cloudy,
    icon_rain,
    icon_snow,
    icon_lightning,
  ];

  const wearImages = [
    icon_scarf,
    icon_padding,
    icon_trenchcoat,
    icon_coat,
    icon_jeans,
    icon_blouses,
    icon_shorts,
    icon_shortsleeves,
    icon_dress,
  ];

  const [currentTemperature, setCurrentTemperature] = useState(null);
  const [currentSky, setCurrentSky] = useState("");
  const [currentPrecipitationType, setCurrentPrecipitationType] = useState("");
  const [currentPrecipitationProbability, setCurrentPrecipitationProbability] =
    useState(null);
  const [currentPrecipitationAmount, setCurrentPrecipitationAmount] =
    useState("");
  const [currentHumidity, setCurrentHumidity] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(weatherImages[0]);
  const [wearIcon, setWearIcon] = useState(wearImages[0]);
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
          setWeatherIcon(weatherImages[0]);
          break;
        case "3":
          setCurrentSky("구름 많고");
          setWeatherIcon(weatherImages[1]);
          break;
        case "4":
          setCurrentSky("흐리고");
          setWeatherIcon(weatherImages[2]);
          break;
      }

      // 6: 강수형태(PTY) -> switch문으로 처리
      switch (currentWeather.response.body.items.item[6].fcstValue) {
        case "0":
          setCurrentPrecipitationType("비가 내리지 않음");
          break;
        case "1":
          setCurrentPrecipitationType("비가 내림");
          setWeatherIcon(weatherImages[3]);
          break;
        case "2":
          setCurrentPrecipitationType("비/눈이 내림");
          setWeatherIcon(weatherImages[4]);
          break;
        case "3":
          setCurrentPrecipitationType("눈이 내림");
          setWeatherIcon(weatherImages[4]);
          break;
        case "4":
          setCurrentPrecipitationType("소나기가 내림");
          setWeatherIcon(weatherImages[5]);
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
        setWearIcon(wearImages[0]); // 목도리
      } else if (currentTemperature >= 5 && currentTemperature <= 8) {
        setWearSuggestion(
          "코트, 울 코트, 가죽 재킷, 플리스, 내복, 니트, 레깅스, 청바지, 두꺼운 바지, 스카프, 기모"
        );
        setWearIcon(wearImages[1]); // 패딩
      } else if (currentTemperature >= 9 && currentTemperature <= 11) {
        setWearSuggestion(
          "재킷, 야상, 점퍼, 트렌치 코트, 니트, 청바지, 면바지, 검은색 스타킹, 기모 바지, 레이어드"
        );
        setWearIcon(wearImages[2]); // 트렌치코트
      } else if (currentTemperature >= 12 && currentTemperature <= 16) {
        setWearSuggestion(
          "재킷, 가디건, 청재킷, 야상, 니트, 스웨트 셔츠(맨투맨), 셔츠, 기모 후드티, 청바지, 면바지, 살구색 스타킹"
        );
        setWearIcon(wearImages[3]); // 코트
      } else if (currentTemperature >= 17 && currentTemperature <= 19) {
        setWearSuggestion(
          "얇은 니트, 얇은 가디건, 얇은 재킷, 후드티, 스웨트 셔츠(맨투맨), 바람막이, 가디건, 긴바지, 청바지, 슬랙스, 스키니진"
        );
        setWearIcon(wearImages[4]); // 청바지
      } else if (currentTemperature >= 20 && currentTemperature <= 22) {
        setWearSuggestion(
          "얇은 가디건, 긴팔 티셔츠, 셔츠, 블라우스, 후드티, 면바지, 슬랙스, 7부 바지, 청바지"
        );
        setWearIcon(wearImages[5]); // 블라우스
      } else if (currentTemperature >= 23 && currentTemperature <= 27) {
        setWearSuggestion(
          "반팔 티셔츠, 얇은 셔츠, 얇은 긴팔 티셔츠, 반바지, 면바지"
        );
        setWearIcon(wearImages[6]); // 반바지
      } else if (currentTemperature >= 28) {
        setWearSuggestion(
          "민소매, 반팔 티셔츠, 반바지(핫팬츠), 민소매 원피스, 짧은 치마, 린넨"
        );
        setWearIcon(wearImages[7]); // 반팔
      }
    }
  }, [currentTemperature]);

  const handleInputChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    const newValue = event.target.value;
    setInputValue(newValue);
  };

  const handleDropdownChange = (event: any) => {
    setInputValue(event.target.value);
    fetchWeatherData(inputValue);
  };

  return (
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
              {year}년 {month}월 {day}일
            </Typography>
          </Toolbar>
        </AppBar>
        <Box display="flex" justifyContent="space-between">
          <Container
            sx={{
              width: "5rem",
              borderRadius: "16px", // 모서리 곡률 설정
              mr: "5rem",
              mt: "2rem",
            }}
          >
            <select value={inputValue} onChange={handleDropdownChange}>
              <option value="서울특별시">서울특별시</option>
              <option value="부산광역시">부산광역시</option>
              <option value="인천광역시">인천광역시</option>
              <option value="대구광역시">대구광역시</option>
              <option value="대전광역시">대전광역시</option>
              <option value="광주광역시">광주광역시</option>
              <option value="울산광역시">울산광역시</option>
              <option value="제주특별자치도">제주특별자치도</option>
              <option value="수원시">수원시</option>
              <option value="고양시">고양시</option>
              <option value="의정부시">의정부시</option>
              <option value="청주시">청주시</option>
              <option value="제천시">제천시</option>
              <option value="천안시">천안시</option>
              <option value="전주시">전주시</option>
              <option value="목포시">목포시</option>
              <option value="순천시">순천시</option>
              <option value="진주시">진주시</option>
              <option value="창원시">창원시</option>
              <option value="포항시">포항시</option>
              <option value="김천시">김천시</option>
              <option value="안동시">안동시</option>
              <option value="춘천시">춘천시</option>
              <option value="강릉시">강릉시</option>
            </select>
          </Container>
          <TextField
            margin="normal"
            label="위치"
            sx={{
              width: "50rem",
              backgroundColor: "rgba(255, 255, 255, 0.9)", // 흰색 배경에 80%의 투명도
              borderRadius: "16px", // 모서리 곡률 설정
              mr: "2rem",
            }}
            value={inputValue}
            onChange={handleInputChange}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{
              width: "10rem",
              mt: 3,
              mb: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "black",
            }}
            onClick={() => fetchWeatherData(inputValue)}
          >
            날씨 보기
          </Button>
        </Box>
        <Container
          sx={{
            justifyContent: "center", // 수직 가운데 정렬
            mt: "3vh",
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pt: "9rem",
                }}
              >
                <Container
                  sx={{
                    width: "17rem",
                    height: "17rem",
                  }}
                >
                  <img
                    src={weatherIcon}
                    style={{ width: "100%", height: "auto" }}
                  />
                </Container>
              </Grid>
              <Grid
                item
                sx={{
                  mr: "20rem",
                }}
              >
                <Typography
                  component="h1"
                  variant="h2"
                  color="text.primary"
                  gutterBottom
                >
                  {currentTemperature}°C
                </Typography>
                <Typography
                  component="h1"
                  variant="h4"
                  color="text.primary"
                  gutterBottom
                >
                  {currentSky}, {currentPrecipitationType}
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                  강수확률: {currentPrecipitationProbability}%
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                  강수량: {currentPrecipitationAmount}
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                  습도: {currentHumidity}%
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Container>

        <Container
          sx={{
            justifyContent: "center", // 수직 가운데 정렬
            mt: "3vh",
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
            <Grid container>
              <Grid
                item
                sx={{
                  flexGrow: 1, // flexGrow를 1로 설정하여 가변폭으로 설정
                  height: "15vh",
                  width: "15vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Container
                  sx={{
                    width: "10rem",
                    height: "10rem",
                  }}
                >
                  <img
                    src={wearIcon}
                    style={{ width: "100%", height: "auto" }}
                  />
                </Container>
              </Grid>
              <Grid
                item
                sx={{
                  mr: "5rem",
                }}
              >
                <Typography
                  component="h1"
                  variant="h3"
                  color="text.primary"
                  gutterBottom
                >
                  오늘 추천 옷
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                  {wearSuggestion}
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Container>
      </Container>
    </>
  );
}

export default App;
