import React, { Component } from "react"
import classnames from "classnames"

import GetShorePowerInputNumber from "../../mqtt/victron/GetShorePowerInputNumber"
import HeaderView from "../HeaderView"
import HidingContainer from "../HidingContainer"
import InputLimit from "./InputLimit"
import MqttSubscriptions from "../../mqtt/MqttSubscriptions"
import MqttWriteValue from "../../mqtt/MqttWriteValue"
import SelectorButton from "../SelectorButton"

import { systemStateFormatter } from "../../utils/util"
import { INVERTER_CHARGER_MODE } from "../../utils/constants"

import "./InverterCharger.scss"

const getTopics = (portalId, vebusInstanceId) => {
  return {
    state: `N/${portalId}/system/0/SystemState/State`,
    mode: `N/${portalId}/vebus/${vebusInstanceId}/Mode`,
    modeIsAdjustable: `N/${portalId}/vebus/${vebusInstanceId}/ModeIsAdjustable`
  }
}

const modeFormatter = mode => {
  switch (mode) {
    case INVERTER_CHARGER_MODE.ON:
      return "On"
    case INVERTER_CHARGER_MODE.OFF:
      return "Off"
    case INVERTER_CHARGER_MODE.CHARGER_ONLY:
      return "Charger only"
  }
}

const possibleModes = [INVERTER_CHARGER_MODE.ON, INVERTER_CHARGER_MODE.OFF, INVERTER_CHARGER_MODE.CHARGER_ONLY]

class InverterCharger extends Component {
  state = { loading: null }

  onModeSelected = mode => {
    this.props.onModeSelected(mode)
    this.setState({ loading: mode })
  }

  componentDidUpdate = prevProps => {
    if (prevProps.mode != this.props.mode) {
      this.setState({ loading: null })
    }
  }

  render() {
    const { mode, state, modeIsAdjustable, onChangeInputLimitClicked, inverterChargerDeviceId, portalId } = this.props
    const disabled = !modeIsAdjustable || this.state.loading

    return (
      <div className="metric charger inverter-charger">
        <GetShorePowerInputNumber portalId={portalId}>
          {shoreInput => {
            return (
              <div
                className={classnames("inverter-charger__header", { "inverter-charger__header--column": !shoreInput })}
              >
                <HeaderView
                  icon={require("../../../images/icons/multiplus.svg")}
                  title="Inverter / Charger"
                  subTitle={systemStateFormatter(state)}
                  child
                />
                <InputLimit
                  portalId={portalId}
                  inverterChargerDeviceId={inverterChargerDeviceId}
                  onChangeInputLimitClicked={onChangeInputLimitClicked}
                  shorePowerInput={shoreInput}
                />
              </div>
            )
          }}
        </GetShorePowerInputNumber>
        <div className="charger__mode-selector">
          {possibleModes.map(m => (
            <SelectorButton
              key={m}
              disabled={disabled}
              loading={this.state.loading === m}
              active={(!this.state.loading && mode === m) || this.state.loading === m}
              onClick={() => this.onModeSelected(m)}
            >
              {modeFormatter(m)}
            </SelectorButton>
          ))}
        </div>
      </div>
    )
  }
}

const InverterChargerWithData = ({
  portalId,
  inverterChargerDeviceId,
  connected,
  metricsRef,
  onChangeInputLimitClicked
}) => {
  return (
    <MqttSubscriptions topics={getTopics(portalId, inverterChargerDeviceId)}>
      {topics => {
        return (
          <MqttWriteValue topic={`W/${portalId}/vebus/${inverterChargerDeviceId}/Mode`}>
            {(_, updateMode) => {
              return (
                <HidingContainer metricsRef={metricsRef}>
                  <InverterCharger
                    {...topics}
                    inverterChargerDeviceId={inverterChargerDeviceId}
                    portalId={portalId}
                    modeIsAdjustable={topics.modeIsAdjustable && connected}
                    onModeSelected={newMode => updateMode(newMode)}
                    onChangeInputLimitClicked={onChangeInputLimitClicked}
                  />
                </HidingContainer>
              )
            }}
          </MqttWriteValue>
        )
      }}
    </MqttSubscriptions>
  )
}

export default InverterChargerWithData
