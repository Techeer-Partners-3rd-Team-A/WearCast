import axios from "axios";

export default async function get_location(address: string) {
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
