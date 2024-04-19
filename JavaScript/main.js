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

//crud 추가
const firebaseConfig = {
  apiKey: "AIzaSyCBJU7XERl_E-U5Mt8986wpY04hds_uFtA",
  authDomain: "sparta-efe13.firebaseapp.com",
  projectId: "sparta-efe13",
  storageBucket: "sparta-efe13.appspot.com",
  messagingSenderId: "120539111338",
  appId: "1:120539111338:web:cc3315d8f6fcb8edcad5d3",
  measurementId: "G-M6G7NZXJRL"
};

// Firebase 인스턴스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


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
$(".commentDelete").click(async function (event) {
  //삭제하는 코드
  const commentBlock = $(this).closest(".commentBlock");
  const name = commentBlock.find(".commentName").text();
  const comment = commentBlock.find(".commentText").text();
  console.log(name + comment + "deldoc으로 전달!");
  deldoc(name.trim(), comment.trim());
});

$(".commentFix").click(async function (event) {
  //수정하는 코드
  const commentBlock = $(this).closest(".commentBlock");
  const name = commentBlock.find(".commentName").text();
  const comment = commentBlock.find(".commentText").text();
  fixdoc(name, comment);
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

async function deldoc(name, comment) {
  //삭제를 시행하는 코드
  const querySnapshot = await find(name, comment);
  if (!querySnapshot.empty) {
      const bringdoc = querySnapshot.docs[0];
      const docId = bringdoc.id;
      const password = bringdoc.data().password;
      const userInput = prompt("비밀번호를 입력해주세요");
      if (password === userInput) {
          await deleteDoc(doc(db, "comment", docId));
          alert("데이터가 삭제되었습니다");
          location.reload();
      } else {
          alert("비밀번호가 올바르지 않습니다");
      }
  } else {
      alert("문서 찾기 오류 발생");
  }
}

async function fixdoc(name, comment) {
  //수정을 진행하는 코드
  const querySnapshot = await find(name, comment);
  if (!querySnapshot.empty) {
      const bringdoc = querySnapshot.docs[0];
      const docId = bringdoc.id;
      const password = bringdoc.data().password;
      const userInput = prompt("비밀번호를 입력해주세요");

      if (password === userInput) {
          let userInputName = prompt(
              "데이터를 수정합니다 변경할 이름\n 빈칸으로 놔둘시 기존으로 유지"
          ); //밑에서 수정하니까 상수변수
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

          await updateDoc(bringdoc.ref, newData);
          alert("데이터가 수정되었습니다");
          location.reload();
      } else {
          alert("비밀번호가 올바르지 않습니다");
      }
  } else {
      alert("문서 찾기 오류 발생");
  }
}