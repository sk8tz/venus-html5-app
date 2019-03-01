import React, { Component } from "react"

import { INVERTER_MODE } from "../../utils/constants"

import HeaderView from "../HeaderView"
import HidingContainer from "../../components/HidingContainer"
import MetricValues from "../MetricValues"
import MqttSubscriptions from "../../mqtt/MqttSubscriptions"
import MqttWriteValue from "../../mqtt/MqttWriteValue"
import NumericValue from "../NumericValue"
import SelectorButton from "../SelectorButton"

import "./Inverter.scss"

const getTopics = (portalId, deviceInstance, source) => {
  return {
    state: `N/${portalId}/${source}/${deviceInstance}/State`,
    mode: `N/${portalId}/${source}/${deviceInstance}/Mode`,
    voltage: `N/${portalId}/${source}/${deviceInstance}/Ac/Out/L1/V`,
    current: `N/${portalId}/${source}/${deviceInstance}/Ac/Out/L1/I`,
    power: `N/${portalId}/${source}/${deviceInstance}/Ac/Out/L1/P`,
    customName: `N/${portalId}/${source}/${deviceInstance}/CustomName`,
    // nAcInputs is obnly available for vebus inverters, for system ones will always be undefined
    nAcInputs: `N/${portalId}/${source}/${deviceInstance}/Ac/NumberOfAcInputs`
  }
}

const stateFormatter = state => {
  switch (state) {
    case 0:
      return "Off"
    case 1:
      return "Low Power"
    case 2:
      return "Fault"
    case 9:
      return "Inverting"
  }
}

const modeFormatter = mode => {
  switch (mode) {
    case INVERTER_MODE.ON:
    case INVERTER_MODE.VEBUS_ON:
      return "On"
    case INVERTER_MODE.OFF:
      return "Off"
    case INVERTER_MODE.ECO:
      return "Eco"
  }
}

export class Inverter extends Component {
  state = { loading: undefined }

  onModeChanged = mode => {
    this.props.updateMode(mode)
    this.setState({ loading: mode })
  }

  componentDidUpdate = prevProps => {
    if (prevProps.mode != this.props.mode) {
      this.setState({ loading: undefined })
    }
  }

  render() {
    const { state, mode, voltage, current, power, customName, nAcInputs, isVebusInverter, metricsRef } = this.props
    // if nAcInputs === 0 it means it's an inverter, if not it's an inverter/charger => skip
    const show = !isVebusInverter || nAcInputs === 0
    // Vebus inverters use mode 3 in stead of 2 for ON.
    const onMode = isVebusInverter ? INVERTER_MODE.VEBUS_ON : INVERTER_MODE.ON
    const possibleModes = [onMode, INVERTER_MODE.OFF, INVERTER_MODE.ECO]

    return (
      show && (
        <HidingContainer metricsRef={metricsRef}>
          <div className="metric inverter">
            <HeaderView icon={require("../../../images/icons/multiplus.svg")} title={customName || "Inverter"} child>
              <MetricValues>
                <p className="text text--smaller">{stateFormatter(state)}</p>
                <NumericValue value={voltage} unit="V" />
                <NumericValue value={current} unit="A" precision={1} />
                <NumericValue value={power || voltage * current} unit="W" />
              </MetricValues>
            </HeaderView>
            <div className="inverter__mode-selector">
              {possibleModes.map(
                m =>
                  (m != INVERTER_MODE.ECO || !isVebusInverter) && (
                    <SelectorButton
                      key={m}
                      disabled={this.state.loading}
                      loading={this.state.loading === m}
                      active={(!this.state.loading && mode === m) || this.state.loading === m}
                      onClick={() => this.onModeChanged(m)}
                    >
                      {modeFormatter(m)}
                    </SelectorButton>
                  )
              )}
            </div>
          </div>
        </HidingContainer>
      )
    )
  }
}

const InverterWithData = ({ portalId, deviceInstance, metricsRef, isVebusInverter }) => {
  const source = isVebusInverter ? "vebus" : "inverter"
  return (
    <MqttWriteValue topic={`W/${portalId}/${source}/${deviceInstance}/Mode`}>
      {(_, updateMode) => (
        <MqttSubscriptions topics={getTopics(portalId, deviceInstance, source)}>
          {topics => (
            <Inverter {...topics} isVebusInverter={isVebusInverter} updateMode={updateMode} metricsRef={metricsRef} />
          )}
        </MqttSubscriptions>
      )}
    </MqttWriteValue>
  )
}

export default InverterWithData
