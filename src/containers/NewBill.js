import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    /**
     * VALIDATION FORMAT IMAGE UPLOADED
     * PNG / JPEG / JPG
     */
    const file = this.document.querySelector(`input[data-testid="file"]`).files
    // get extension
    const filePath = file[0].name.split(".").pop()
    // store image 
    if(filePath === "jpg" || filePath === "jpeg" || filePath === "png") {
      const fileName = filePath[filePath.length-1]
      this.firestore
        .storage
        .ref(`justificatifs/${fileName}`)
        .put(file)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
          this.fileUrl = url
          this.fileName = fileName
        })
        this.document.getElementById("wrongFormat").innerText = ""
    } else {
      // reject storing image because wrong format
      this.document.querySelector(`input[data-testid='file']`).value = null;
      this.document.getElementById("wrongFormat").innerText = "Seul les images avec l'extension suivante sont autorisées : jpg, jpeg ou png"

    }
  }
  handleSubmit = e => {
    e.preventDefault()
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
    if(bill['name'].length > 5) {
      this.createBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
      this.document.getElementById('missingName').innerText = ""
    }else {
      this.document.getElementById('missingName').innerText = "il faut ajouter un nom à la dépense d'au moins 5 lettres"
    }
  }

  // not need to cover this function by tests
  createBill = (bill) => {
    if (this.firestore) {
      this.firestore
      .bills()
      .add(bill)
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => error)
    }
  }
}