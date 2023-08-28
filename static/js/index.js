$(document).ready(function () {
  let fetchedAddresses = [];
  let previousInput = "";
  let timeoutId = null;

  const MIN_INPUT_LENGTH = 3; // 최소 입력 길이 설정
  const DELAY_TIME_MS = 500; // 딜레이 시간 설정 (0.5초)

  const getAddressData = function (input) {
    console.log("주소 데이터를 요청합니다: ", input);
    return $.ajax({
      url: "/autocomplete",
      method: "GET",
      dataType: "json",
      data: { search: input },
    }).done(function () {
      console.log("주소 데이터 요청이 완료되었습니다.");
    });
  };

  const updateView = (data) => {
    $("#suggested-addresses-list").empty();

    if (data.error) {
      $("#suggested-addresses-list").append(`<li>${data.error}</li>`);

      return;
    }

    data.suggestions.forEach(function (address) {
      const delivery_line_1 = address.street_line;
      const last_line = `${address.city}, ${address.state} ${address.zipcode}`;

      let addressItem = $("<li>")
        .text(`${delivery_line_1}, ${last_line}`)
        .click(function () {
          $("#zipcode").val(address.zipcode);
          $("#street").val(delivery_line_1);
          console.log(`${delivery_line_1}, ${last_line}`);
        });

      $("#suggested-addresses-list").append(addressItem);
    });
  };

  $("#street").on("input", function () {
    clearTimeout(timeoutId);

    let inputValue = $(this).val().trim();

    console.log(`사용자 입력 처리 - '${inputValue}'`);

    if (!inputValue || inputValue.length < MIN_INPUT_LENGTH) {
      $("#suggested-addresses-list").empty();
      return;
    }

    timeoutId = setTimeout(() => {
      getAddressData(inputValue)
        .done(function (data) {
          if (!Array.isArray(data.suggestions)) {
            if (data.error) {
              updateView(data);
            } else {
              console.error(
                "API 응답 오류 : 주소 데이터 배열이 아닙니다.",
                data
              );
            }

            return;
          }

          fetchedAddresses = data.suggestions;

          previousInput = inputValue;

          let inputWordsSet = new Set(inputValue.toLowerCase().split(/\s+/));
          console.log(`입력 단어 :${[...inputWordsSet]}`);

          let filteredAddresses = fetchedAddresses.filter((address) => {
            let addressWordsSet = new Set(
              `${address.street}
  ${address.city}
  ${address.state}`
                .toLowerCase()
                .split(/\s+/)
            );

            return [...inputWordsSet].every((word) =>
              addressWordsSet.has(word)
            );
          });
          updateView(filteredAddresses);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          cconsole.error("API 호출에 실패했습니다. js error");
          console.error("Error thrown: ", errorThrown);
          console.error("Text status: ", textStatus);
          console.log("js 호출실패 확인 필");
        });
    }, DELAY_TIME_MS);
  });
});
