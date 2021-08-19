import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {
  fireEvent,
  screen
} from "@testing-library/dom"
import firestore from "../app/Firestore";
import {
  bills
} from "../fixtures/bills.js"
import firebase from "../__mocks__/firebase"
import {
  localStorageMock
} from '../__mocks__/localStorage.js'
import {
  handleSubmit
} from '../containers/NewBill.js'
import {
  ROUTES_PATH
} from '../constants/routes.js'
import {
  ROUTES
} from "../constants/routes"
import BillsUI from "../views/BillsUI.js";

// SET SESSION STORAGE
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({
    pathname
  })
}


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and load image with wrong format", () => {
    test("Then image is not loaded", () => {
      // create NewBill UI
      const html = NewBillUI()
      // Insert NewBill UI in the body
      document.body.innerHTML = html
      // Image name
      const fileName = "preview-facture-free-201801-pdf-1.svg"
      // input element
      const file = screen.getByTestId("file");
      // get extension image format
      const extension = fileName.split(".").pop() // SVG
      // error message element
      const error = document.getElementById("wrongFormat")
      // error message
      const errorMessage = "Seul les images avec l'extension suivante sont autorisées : jpg, jpeg ou png"
      // Instanciation of NewBill class
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: localStorageMock
      })
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
          files: [new File([fileName], fileName, {
            type: `${extension}`
          })],
        },
      })
      // handleChangeFile call
      expect(handleChangeFile).toHaveBeenCalled();
      // file loaded has jpg extension
      expect(error.innerText).toBe(errorMessage)
      /**
       * QUESTION AFFICHAGE MESSAGE ERREUR LORS DU TELECHARGEMENT DU MAUVAIS FORMAT
       *    document.getElementById("wrongFormat").innerText; --> "Seul les images avec l'extension suivante sont autorisées : jpg, jpeg ou png"
            screen.getByText(errorMessage) --> ""
      * 
      */


    })
    describe("when I am on NewBill page", () => {
      test("then I submit form", () => {
        // create NewBill UI
        const html = NewBillUI()
        // insert newBill UI to document
        document.body.innerHTML = html
        // Instanciation of NewBill class
        const newBill = new NewBill({
          document,
          onNavigate,
          firestore,
          localStorage: localStorageMock
        })
        // mock handleSubmit method
        const handleSubmit = jest.fn(newBill.handleSubmit)
        // Submit button
        const form = screen.getByTestId("form-new-bill")
        // add submit event to submitButton
        form.addEventListener("submit", handleSubmit)
        // Click on submitButton
        fireEvent.submit(form)

        expect(handleSubmit).toHaveBeenCalledTimes(1)
      })
    })
  })
})



// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  test("post bills with mock API POST", async () => {
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

    const postSpy = jest.spyOn(firebase, "post")
    const bills = await firebase.post(testData)
    expect(postSpy).toHaveBeenCalledTimes(1) //--> tous les post avec firebase fait dans le fichier sont comptabilisé
    expect(bills.data.length).toBe(5)
  })
  test("post bills from an API and fails with 404 message error", async () => {
    firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 404"))
    )
    const html = BillsUI({
      error: "Erreur 404"
    })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })
  test("fetches messages from an API and fails with 500 message error", async () => {
    firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 500"))
    )
    const html = BillsUI({
      error: "Erreur 500"
    })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })
})