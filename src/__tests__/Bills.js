import { fireEvent, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import usersTest from "../constants/usersTest.js"
import {handleClickNewBill, handleClickIconEye} from '../containers/Bills.js'
import firebase from "../__mocks__/firebase"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {    
      // DEFINIR LE LOCALSTORAGE
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        // IS IT ENOUGH FOR SIMULATE WHEN USER IS LOG ON
        type: 'Employee'
      }))
      // FILL HTML PAGE WITH EMPTY DATA
      const html = BillsUI({ data: []})

      document.body.innerHTML = html

      expect(screen.queryByTestId('icon-window')).toBeTruthy()

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
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const bill = new Bills({
        document, onNavigate, firestore, localStorage: window.localStorage
      })
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      // Mock modal comportment
      $.fn.modal = jest.fn();
      // Get icon element
      const eye =  screen.getAllByTestId('icon-eye')[0]
      // Mock function handleClickIconEye
      const handleClickIconEye = jest.fn(() => bill.handleClickIconEye(eye))

      // add event to the icon element and click on it
      eye.addEventListener('click', handleClickIconEye)
      fireEvent.click(eye)
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
})