import React, { Component } from "react"
import SelectorButton from "../SelectorButton/SelectorButton"
import PropTypes from "prop-types"
import { formatNumber } from "../NumericValue"

class CurrentLimitIncrementor extends Component {
  state = { loading: undefined }

  onLimitChanged = limit => {
    this.props.onInputLimitChanged(limit)
    this.setState({ loading: limit })
  }

  componentDidUpdate = prevProps => {
    if (prevProps.currentLimit != this.props.currentLimit) {
      this.setState({ loading: undefined })
    }
  }

  render() {
    const { currentLimit } = this.props
    return (
      <>
        <SelectorButton
          narrow
          disabled={this.state.loading}
          loading={this.state.loading < currentLimit}
          className="metric__current-input-limit__decrement"
          onClick={() => this.onLimitChanged(currentLimit - 1)}
        >
          <span className="text--small">-</span>
        </SelectorButton>
        <span className="text--bold metric__current-input-limit__limit">
          {formatNumber({ value: currentLimit, unit: "A" })}
        </span>
        <SelectorButton
          narrow
          disabled={this.state.loading}
          loading={this.state.loading > currentLimit}
          className="metric__current-input-limit__increment"
          onClick={() => this.onLimitChanged(currentLimit + 1)}
        >
          <span className="text--small">+</span>
        </SelectorButton>
      </>
    )
  }
}

CurrentLimitIncrementor.propTypes = {
  onInputLimitChanged: PropTypes.func,
  currentLimit: PropTypes.number
}

export default CurrentLimitIncrementor
