export class TableView {
  constructor(node, cellMinWidth) {
    this.node = node
    this.cellMinWidth = cellMinWidth
    this.dom = document.createElement("div")
    this.dom.className = "tableWrapper"
    this.table = this.dom.appendChild(document.createElement("table"))
    this.colgroup = this.table.appendChild(document.createElement("colgroup"))
    updateColumns(node, this.colgroup, this.table, cellMinWidth)
    this.contentDOM = this.table.appendChild(document.createElement("tbody"))
  }

  update(node) {
    if (node.type != this.node.type) return false
    this.node = node
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth)
    return true
  }

  ignoreMutation(record) {
    return record.type == "attributes" && (record.target == this.table || this.colgroup.contains(record.target))
  }
}

export function updateColumns(node, colgroup, table, cellMinWidth, overrideCol, overrideValue) {
  let totalWidth = 0, fixedWidth = true, noTableWidth = true
  let nextDOM = colgroup.firstChild, row = node.firstChild, defaultWidth = 180, updatedColValType = null, updatedColVal = 0
  
  for (let i = 0, col = 0; i < row.childCount; i++) {
    let {colspan, colwidth} = row.child(i).attrs
    for (let j = 0; j < colspan; j++, col++) {
      let hasWidth = overrideCol == col ? overrideValue : colwidth && colwidth[j]      
      let _colwidth = colwidth ? colwidth[j] : defaultWidth
      
      totalWidth += hasWidth || cellMinWidth

      if (overrideCol == col) {
        if (_colwidth >= hasWidth) {
          updatedColValType = 'ADD'
          updatedColVal = _colwidth - hasWidth
        } else {
          updatedColValType = 'DELETE'
          updatedColVal = hasWidth - _colwidth
        }
      }

      if ((overrideCol + 1) == col) {
        if (updatedColValType == 'ADD') {
          hasWidth += updatedColVal
        } else {
          hasWidth -= updatedColVal
        }
      }

      let cssWidth = hasWidth ? hasWidth + "px" : ""
      
      if (!hasWidth) fixedWidth = false
      if (!nextDOM) {
        colgroup.appendChild(document.createElement("col")).style.width = cssWidth
      } else {
        if (cssWidth != "" && (nextDOM.style.width != cssWidth)) nextDOM.style.width = cssWidth
        nextDOM = nextDOM.nextSibling
      }
    }
  }

  while (nextDOM) {
    let after = nextDOM.nextSibling
    nextDOM.parentNode.removeChild(nextDOM)
    nextDOM = after
  }

  if (noTableWidth) {
    if (fixedWidth) {
      table.style.minWidth = ""
    } else {
      table.style.width = ""
    }
  } else {
    if (fixedWidth) {
      table.style.width = totalWidth + "px"
      table.style.minWidth = ""
    } else {
      table.style.width = ""
      table.style.minWidth = totalWidth + "px"
    }
  }
}
