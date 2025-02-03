const handleInsertIcons = (setPreviewSettings: any, setTempVar: any, message: any, tempVar: any) => {
  setPreviewSettings({
    content: message() + `${tempVar()}`
  })

  setTempVar(null)
}

export {
  handleInsertIcons
}