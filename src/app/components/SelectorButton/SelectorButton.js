import React, { Component } from "react"
import classNames from "classnames"

import { Spinner } from "../Spinner"

class SelectorButton extends Component {
  render() {
    const { disabled, active, loading, narrow, onClick, className, children } = this.props
    return (
      <button
        disabled={disabled}
        onClick={!active ? onClick : () => {}}
        className={classNames(
          "selector-button",
          "text",
          { "selector-button--active": active, "selector-button--narrow": narrow, "selector-button--loading": loading },
          className || ""
        )}
      >
        {loading ? <Spinner /> : children}
      </button>
    )
  }
}

export default SelectorButton
