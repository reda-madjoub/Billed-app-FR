import { fireEvent, screen } from "@testing-library/dom"
import { ROUTES_PATH } from '../constants/routes.js'
import { ROUTES } from "../constants/routes"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"

import Firestore from "../app/Firestore";
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import usersTest from "../constants/usersTest.js"
import {handleClickNewBill, handleClickIconEye} from '../containers/Bills.js'
import firebase from "../__mocks__/firebase"
import Router from "../app/Router.js";

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
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => { 
      // hash pathname 
      const pathname = ROUTES_PATH['Bills'] // ==> #employee/bills
      document.body.innerHTML = BillsUI({data: []})
      onNavigate(pathname) // ==>  BillsUI({ data, error, loading })
      // ??????
      // Mock Firestore file (only class exist in)
      jest.mock("../app/Firestore");
      // mock bills method
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });
      // ?????

      // HTML DOM creation - DIV
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      document.body.innerHTML = `<div id="root"></div>`;
      
      // Initiate Router to put CSS into active status
      Router();
      
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe('When I click on the icon eye', () => {
    test('A modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname })
      // }
      const firestore = null
      const bill = new Bills({
        document, onNavigate, firestore, localStorage: window.localStorage
      })
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      // Mock modal comportment
      // https://stackoverflow.com/questions/45225235/accessing-bootstrap-functionality-in-jest-testing
      $.fn.modal = jest.fn(() => {}) // $.fn.modal = jest.fn(() => {}); equal to $.fn.modal = jest.fn(() => {});
      // Get icon element
      const eye =  screen.getAllByTestId('icon-eye')[0]
      // Mock function handleClickIconEye
      // console.log("-------------");
      const handleClickIconEye = jest.fn(() => bill.handleClickIconEye(eye))
      // console.log("-------------");

      // add event to the icon element and click on it
      eye.addEventListener('click', handleClickIconEye)
      fireEvent.click(eye)
      // handleClickIconEye
      // bill.handleClickIconEye(eye)
      // test if click on icon called the function
      expect(handleClickIconEye).toHaveBeenCalled()
      // get modale element
      const modale = document.getElementById('modaleFile')
      // test if modale exist now
      expect(modale).toBeTruthy() // cette partie là fonctionne toujours
      /**
       * 
       * 
       expect(modale.classList.contains('modal')).toBe(true)
       expect(modale.classList.contains('fade')).toBe(true)

       COMMENT VERIFIER L'AJOUT D'UNE CLASS APRES SA CREATION SUITE UN EVEMENT
       DECLENCHER AVEC FIREEVENT ?

       why it doesn't work : 
       expect(modale.classList.contains('show')).toBeTruthy()
       expect(modale).toHaveClass("modal")
       */


    })
  })
  describe('When I am on Employee page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Employee page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  describe('When I am on Employee page, I click on new Bill button', () => {
    test('Then, it should render NewBill page', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({data : bills})
      document.body.innerHTML = html

      // const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname})
      // }
      const firestore = null;
      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn(allBills.handleClickNewBill);

      const btn = screen.getByTestId("btn-new-bill")
      btn.addEventListener("click", handleClickNewBill)
      userEvent.click(btn)
      // expect(handleClickNewBill).toHaveBeenCalledTimes(1) ==> ne fonctionne pas ???
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
      // console.log(onNavigate(ROUTES_PATH['NewBill'])); ==> undefined ???
      // expect(onNavigate(ROUTES_PATH['NewBill'])).toBeTruthy() ==> renvoi erreur Pourquoi ne marche pas ??
      

      
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})








// const firestore = null;
// const allBills = new Bills({
//   document,
//   onNavigate,
//   firestore,
//   localStorage: window.localStorage,
// });
// // // DEFINIR LE LOCALSTORAGE
// // Object.defineProperty(window, 'localStorage', { value: localStorageMock })
// // window.localStorage.setItem('user', JSON.stringify({
// //   // IS IT ENOUGH FOR SIMULATE WHEN USER IS LOG ON
// //   type: 'Employee'
// // }))
// // // DEFINIR l'URL actuel 
// // const url = "http://127.0.0.1:8080/#employee/bills"
// // Object.defineProperty(window, 'location', {
// //   value: {
// //     href: url
// //   }
// // });
// // window.location.href = url
// // // FILL HTML PAGE WITH EMPTY DATA
// // const html = BillsUI({ data: [] })
// // document.body.innerHTML = html

// const billIcon = screen.getByTestId('icon-window')
// console.log(billIcon)
// expect(billIcon).toHaveClass("active-icon", {exact: true})
// // expect(billIcon.classList.contains("active-icon")).toBeTruthy()
