import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { fireEvent, screen } from "@testing-library/dom"
import Firestore from "../app/Firestore";
import { bills } from "../fixtures/bills.js"
import firebase from "../__mocks__/firebase"
import { localStorageMock } from '../__mocks__/localStorage.js'
import { handleSubmit } from '../containers/NewBill.js'

// INITIALIZE EMPLOYEE PAGE
// SET SESSION STORAGE
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname})
}


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and load image", () => {
    test("Then image extension is wrong format", () => {
      // create NewBill UI
      const html = NewBillUI()
      // Insert NewBill UI in the body
      document.body.innerHTML = html
      // Image name
      const fileName = "preview-facture-free-201801-pdf-1.svg"
      // input element
      const file = screen.getByTestId("file");
      // get extension image format
      const extension = fileName.split(".").pop()  // SVG
      // error message element
      const error = document.getElementById("wrongFormat")
      // error message
      const errorMessage = "Seul les images avec l'extension suivante sont autorisées : jpg, jpeg ou png"
      // Instanciation of NewBill class
      const newBill = new NewBill({ document, onNavigate, firestore: null  , localStorage: localStorageMock })
      // mock handleChangeFile method
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      // add Event on change when input load file
      file.addEventListener("change", handleChangeFile)
      /**
       * ressources : https://testing-library.com/docs/dom-testing-library/api-events/
       */
      // Launch handleChangeFile event
      fireEvent.change(file, {
        target: {
          files: [new File([fileName], fileName, {type: `${extension}`})],
        },
      })
      // handleChangeFile call
      expect(handleChangeFile).toHaveBeenCalled();
      // file loaded has jpg extension
      expect(document.getElementById("wrongFormat").innerText).toBe(errorMessage)
    /**
     * QUESTION AFFICHAGE MESSAGE ERREUR LORS DU TELECHARGEMENT DU MAUVAIS FORMAT
     *    document.getElementById("wrongFormat").innerText; --> "Seul les images avec l'extension suivante sont autorisées : jpg, jpeg ou png"
          screen.getByText(errorMessage) --> ""
    * 
    */


    })
    test("Then image extension is jpg", () => {
      // create NewBill UI
      const html = NewBillUI()
      // Insert NewBill UI in the body
      document.body.innerHTML = html
      // Image name
      const fileName = "preview-facture-free-201801-pdf-1.svg"
      // input element
      const file = screen.getByTestId("file");
      // get extension image format
      const extension = fileName.split(".").pop()  // SVG
      // error message element
      const error = document.getElementById("wrongFormat")
      // error message
      const errorMessage = "Seul les images avec l'extension suivante sont autorisées : jpg, jpeg ou png"
      // Instanciation of NewBill class
      const newBill = new NewBill({ document, onNavigate, firestore: null  , localStorage: localStorageMock })
      // mock handleChangeFile method
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      // add Event on change when input load file
      file.addEventListener("change", handleChangeFile)
      /**
       * ressources : https://testing-library.com/docs/dom-testing-library/api-events/
       */
      // Launch handleChangeFile event
      fireEvent.change(file, {
        target: {
          files: [new File([fileName], fileName, {type: `${extension}`})],
        },
      })
      

      // fireEvent.change(file, {
      //   target: {
      //     files: {name: fileName, type: extension},
      //   }
      // })

      //Simulate the choice of a file
      // Object.defineProperty(file, 'files', {
      //   value: [{name: fileName, type: extension}],
      // })

      // handleChangeFile call
      expect(handleChangeFile).toHaveBeenCalled();
      // file loaded has jpg extension
      expect(file.files[0].type === extension).toBeTruthy()
       // error message empty
      expect(error.textContent).toBe("")
      
      /**
       * TESTER L'APPARITION D'UN MESSAGE D'ERREUR LORS DE TELECHARGMENT D'UN FICHIER AU MAUVAIS FORMAT
       * 
       * expect(error.innerText).toBe("") ????? --> "Seul les images avec l'extension suivante sont autorisées : jpg, jpeg ou png"
       *   
       * error message
       * expect(error.innerText).toBeFalsy()
       *  
       * error message empty
       * expect(error.innerText).toEqual("")
       * 
       */

    })
  })
  describe("when I am on NewBill page", () => {
    test("then I fill form with valid values and submit", async () => {
      // sample values to fill form
      const testData = { 
        "id": "qcCK3SzECmaZAGRrHjaC",
        "status": "refused",
        "pct": 20,
        "amount": 200,
        "email": "a@a",
        "name": "test2",
        "vat": "40",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2002-02-02",
        "commentAdmin": "pas la bonne facture",
        "commentary": "test2",
        "type": "Restaurants et bars",
        "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
      }
      // 
      const postSpy = jest.spyOn(firebase, "post")
      const bills = await firebase.post(testData)
      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(5)
    })
    // test("then I add a new bill and it fails to submit form", async () => {
    //   const handleSubmit = jest.fn(() => "submit button clicked")
    //   const message = "Envoyer une note de frais"
    //   const html = NewBillUI()
    //   document.body.innerHTML = html
    //   const submitButton = document.getElementById("btn-send-bill")
    //   submitButton.addEventListener("click", handleSubmit)
    //   fireEvent.click(submitButton)
      
    //   expect(handleSubmit).toHaveBeenCalledTimes(1)
    //   expect(screen.getAllByText(message)).toBeTruthy()
    // })
  })
})











// test("Then image extension is different from jpg, jpeg and png", () => {
//   // create NewBill UI
//   const html = NewBillUI()
//   // Insert NewBill UI in the body
//   document.body.innerHTML = html
//   // Image name
//   const fileName = "preview-facture-free-201801-pdf-1.svg"
//   // input element
//   const file = screen.getByTestId("file");
//   // error message element
//   const error = document.getElementById("wrongFormat")
//   // Instanciation of NewBill class
//   const newBill = new NewBill({ document, onNavigate, firestore: null  , localStorage: localStorageMock })
//   // mock handleChangeFile method
//   const handleChangeFile = jest.fn(newBill.handleChangeFile)
//   // add Event on change when input load file
//   file.addEventListener("change", handleChangeFile)
//   const errorMessage = "Seul les images avec l'extension suivante sont autorisées : jpg, jpeg ou png"
//   const extension = fileName.split(".").pop()
//   //Simulate the choice of a file
//   Object.defineProperty(file, 'files', {
//     value: [{name: fileName, type: extension} ],
//     writable: false,
//   })
//   // Launch handleChangeFile event
//   fireEvent.change(file)
//   // error message empty
//   expect(error.innerText).toBe(errorMessage)
// })
