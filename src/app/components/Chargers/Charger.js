import React from "react"
import MqttSubscriptions from "../../mqtt/MqttSubscriptions"
import HeaderView from "../../components/HeaderView"
import NumericValue from "../NumericValue/NumericValue"
import HidingContainer from "../../components/HidingContainer"
import MetricValues from "../MetricValues/MetricValues"
import SelectorButton from "../SelectorButton/SelectorButton"
import { SYSTEM_MODE } from "../../utils/constants"

const getTopics = (portalId, deviceInstanceId) => {
  return {
    currentLimit: `N/${portalId}/charger/${deviceInstanceId}/Ac/In/CurrentLimit`,
    state: `N/${portalId}/charger/${deviceInstanceId}/State`,
    mode: `N/${portalId}/charger/${deviceInstanceId}/Mode`,
    nrOfOutputs: `N/${portalId}/charger/${deviceInstanceId}/NrOfOutputs`,
    current: [
      `N/${portalId}/charger/${deviceInstanceId}/Dc/0/Current`,
      `N/${portalId}/charger/${deviceInstanceId}/Dc/1/Current`,
      `N/${portalId}/charger/${deviceInstanceId}/Dc/2/Current`
    ]
  }
}

// TODO Check values for mode and state
const chargerModeFormatter = value => {
  if (value == 0) return "OFF"
  if (value == 1) return "ON"
  return "--"
}

const chargerStateFormatter = value => {
  if (value == 0) return "Off"
  if (value == 1) return "Low power"
  if (value == 2) return "VE.Bus Fault condition"
  if (value == 3) return "Bulk charging"
  if (value == 4) return "Absorption charging"
  if (value == 5) return "Float charging"
  if (value == 6) return "Storage mode"
  if (value == 7) return "Equalisation charging"
  return "--"
}

const Charger = ({ nrOfOutputs, current, state, mode, onModeSelected }) => {
  const output = (
    <div>
      <span className="text text--smaller">Output</span>
      {current.map((v, i) => (
        <NumericValue value={current[i]} unit="A" precision={1} />
      ))}
    </div>
  )

  const systemMode = chargerModeFormatter(mode)
  const modeIsAdjustable = true // For chargers, mode is always adjustable
  return (
    <div className="metric charger">
      <HeaderView icon={require("../../../images/icons/multiplus.svg")} title="Charger" child>
        <MetricValues>
          <p className="text text--smaller">{chargerStateFormatter(state)}</p>
        </MetricValues>
      </HeaderView>
      <div className="charger__output">{output}</div>
      <div className="charger__mode-selector">
        <SelectorButton
          disabled={!modeIsAdjustable}
          active={systemMode === "ON"}
          onClick={() => onModeSelected(SYSTEM_MODE.ON)}
        >
          On
        </SelectorButton>
        <SelectorButton
          disabled={!modeIsAdjustable}
          active={systemMode === "OFF"}
          onClick={() => onModeSelected(SYSTEM_MODE.OFF)}
        >
          Off
        </SelectorButton>
      </div>
    </div>
  )
}

const ChargerWithData = ({ portalId, deviceInstanceId }) => (
  <HidingContainer>
    <MqttSubscriptions topics={getTopics(portalId, deviceInstanceId)}>
      {topics => <Charger {...topics} />}
    </MqttSubscriptions>
  </HidingContainer>
)

export default ChargerWithData