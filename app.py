from flask import Flask, request, jsonify
import requests
import logging

app = Flask(__name__)

# 로그 설정
logging.basicConfig(level=logging.INFO)


def build_address(suggestion):
    white_space = ""
    if suggestion.get("secondary"):
        if suggestion.get("entries", 0) > 1:
            suggestion["secondary"] += f" ({suggestion['entries']} entries)"
        white_space = " "
    return f"{suggestion['street_line']}{white_space}{suggestion['secondary']} {suggestion['city']}, {suggestion['state']} {suggestion['zipcode']}"


@app.route("/autocomplete", methods=["GET"])
def autocomplete():
    try:
        # 서버키
        auth_id = "fdecf629-0a7c-2f8b-a254-88d0ebf14839"
        auth_token = "PA3jWIFFL3bS7ZEwz3ce"

        # 클라이언트에서 받은 검색어
        street_address = request.args.get("search", "")

        # 클라이언트에서 서버 url로 변경

        # https://us-autocomplete-pro.api.smarty.com/lookup?key=YOUR+EMBEDDED+KEY+HERE
        # api_url = f"https://us-autocomplete-pro.api.smarty.com/lookup?search={search_term}&max_results={max_results}&key={api_key}"
        # api_url = f"https://us-autocomplete-pro.api.smarty.com/lookup?prefer_geolocation={search_term}&key={api_key}"

        # =====클라이언트 세팅값=======
        # SmartyStreets API 키 (환경 변수 또는 직접 문자열로 입력)
        # api_key = "PA3jWIFFL3bS7ZEwz3ce"
        # 선택적 파라미터들 필요에 따라 추가 가능.
        # max_results = request.args.get("max_results", "10")
        # 필수 HTTP 헤더 추가
        # headers = {
        #     "Host": "us-autocomplete-pro.api.smarty.com",
        #     "Referer": "xeostop1.pythonanywhere.com/",  # 실제 사용하는 웹사이트 주소 진짜 내가 호스팅하고 있는 주소를 써야 돼 ㅠㅠㅠㅠ
        # }

        api_url = "https://us-street.api.smarty.com/street-address"
        params = {
            "street": street_address,
            "auth-id": auth_id,
            "auth-token": auth_token,
        }
        response = requests.get(api_url, params=params)
        # response = requests.get(api_url, headers=headers)

        if response.status_code != 200:
            logging.error("API 요청에 실패했습니다.python 확인필요")
            return jsonify({"error": "API 요청에 실패했습니다.python 확인필요"}), 500

        data = response.json()

        for suggestion in data["suggestions"]:
            address = build_address(suggestion)
            print(address)

        return jsonify(data)

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An unexpected error occurred."}), 500


if __name__ == "__main__":
    app.run(debug=True)
