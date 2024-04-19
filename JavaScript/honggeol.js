//모듈 기능에 따라 필요한 기능을 가져오는 코드입니다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  collection,
  addDoc,
  getDocs,
  where,
  query,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  //이건 직접 만드신 firebase에서 키값을 가져오셔야 데이터가 중복입력 되지 않습니다
  apiKey: "AIzaSyDMOlKgeEnac-EPzR347HpkbYsCgHTXccI",
  authDomain: "sparta-cb68a.firebaseapp.com",
  projectId: "sparta-cb68a",
  storageBucket: "sparta-cb68a.appspot.com",
  messagingSenderId: "414469595350",
  appId: "1:414469595350:web:ccfa2aa689cc30916a6977",
  measurementId: "G-FN0GGZEKBH",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/*HTML 규칙 
    이름을 쓰는 칸의 class는 "name"
    코멘트를 쓰는 칸의 class는 "comment"
    비밀번호를 쓰는 칸의 Class는 "password"
    (ID로 쓰지 않도록 주의해주세요)

    버튼은 태그 내부에 꼭 type="button"이 포함되어야 비동기 처리가 정상적으로 작동합니다
    버튼은 id="commentWrite" 를 써 주시면 됩니다

    jquery 필수!
    19,25,26 번째 줄의 스크립트 코드를 전부 가져오시고,위의 firebaseConfig 설정을 교체하셨다면
    이 아래 코드부터 마지막까지 전부 복붙하시면 됩니다
    */

$("#commentWrite").click(async function () {
  let name = $(".name").val();
  let comment = $(".comment").val();
  let password = $(".password").val();
  let doc = {
    name: name,
    comment: comment,
    password: password,
  };
  let valueCheck = false;
  if (doc.name !== "") {
    if (doc.comment !== "") {
      if (doc.password !== "") {
        valueCheck = true;
      } else {
        alert("비밀번호를 채워주세요");
      }
    } else {
      alert("내용을 채워주세요");
    }
  } else {
    alert("이름을 채워주세요");
  }

  if (valueCheck) {
    await addDoc(collection(db, "comment"), doc).then(() => {
      alert("데이터 등록완료");
      location.reload();
    });
  }
});

let docs = await getDocs(collection(db, "comment"));
docs.forEach((doc) => {
  let row = doc.data();
  let name = row["name"];
  let comment = row["comment"];

  let temp_html = `                                                 
      <div class="commentBlock">
        <p class="commentName">${name}:</p> 
        <p class="commentText">${comment}</p>
        <button type="button" class="commentDelete">삭제</button>
        <button type="button" class="commentFix">수정</button>
      </div>`;
  $(".visitcomment").append(temp_html);
});
/*위 코드는 데이터베이스가 등록될때마다 자동으로 생성할 HMTL폼에 관한 내용입니다 백틱(`)안의 내용을 전부 지우고 새로 만드신 형식에 맞게 작성해주세요*/
$(".commentDelete").click(async function () {
  //삭제하는 코드
  const commentBlock = $(this).closest(".commentBlock");
  deldoc(commentBlock);
});

$(".commentFix").click(async function () {
  //수정하는 코드
  const commentBlock = $(this).closest(".commentBlock");
  fixdoc(commentBlock);
});

async function find(name, comment) {
  console.log(name + comment + "find으로 전달!");
  const q = query(
    collection(db, "comment"),
    where("name", "==", name.replace(":", "")),
    where("comment", "==", comment)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot;
}

async function deldoc(ref) {
  //삭제를 시행하는 코드
  const name = ref.find(".commentName").text().trim();
  const comment = ref.find(".commentText").text().trim();
  const querySnapshot = await find(name, comment);
  if (!querySnapshot.empty) {
    const bringdoc = querySnapshot.docs[0];
    const docId = bringdoc.id;
    const password = bringdoc.data().password;
    const userInput = prompt("비밀번호를 입력해주세요");
    if (password === userInput) {
      await deleteDoc(doc(db, "comment", docId))
        .then((result) => {
          console.log(result);
        })
        .catch((error) => {
          alert("오류발생: " + error);
        });
      alert("데이터가 삭제되었습니다");
      location.reload();
    } else {
      alert("비밀번호가 올바르지 않습니다");
    }
  } else {
    alert("문서 찾기 오류 발생");
  }
}

async function fixdoc(ref) {
  //수정을 진행하는 코드
  const name = ref.find(".commentName").text().trim();
  const comment = ref.find(".commentText").text().trim();
  const querySnapshot = await find(name, comment);
  if (!querySnapshot.empty) {
    const bringdoc = querySnapshot.docs[0];
    const password = bringdoc.data().password;
    const userInput = prompt("비밀번호를 입력해주세요");

    if (password === userInput) {
      let userInputName = prompt(
        "데이터를 수정합니다 변경할 이름\n 빈칸으로 놔둘시 기존으로 유지"
      );
      let userInputComment = prompt(
        "내용을 수정합니다\n 빈칸으로 놔둘시 기존으로 유지"
      );
      if (userInputName == "" || userInputName == null) {
        userInputName = bringdoc.data().name;
      }
      if (userInputComment == "" || userInputComment == null) {
        userInputComment = bringdoc.data().comment;
      }
      const newData = {
        name: userInputName,
        comment: userInputComment,
        password: password,
      };

      await updateDoc(bringdoc.ref, newData)
        .then((result) => {
          console.log(result);
        })
        .catch((error) => {
          alert(error);
        });
      alert("데이터가 수정되었습니다");
      location.reload();
    } else {
      alert("비밀번호가 올바르지 않습니다");
    }
  } else {
    alert("문서 찾기 오류 발생");
  }
}
