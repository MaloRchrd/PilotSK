import React, { useState, useEffect } from "react";
import { StyleSheet, Alert, SafeAreaView, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Button,
  Divider,
  Layout,
  TopNavigation,
  withStyles,
  ButtonGroup,
  Text,
  Icon,
  MenuItem,
  TopNavigationAction,
  OverflowMenu,
} from "@ui-kitten/components";
import { ThemeContext } from "../assets/theme/theme-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const HomeScreen = ({ navigation }) => {
  const navigateDetails = () => {
    navigation.navigate("Settings");
  };
  const themeContext = React.useContext(ThemeContext);

  // const navigateDetails = () => {
  //   navigation.navigate("Details");
  // };

  // const [login, setLogin] = useState("");
  // const [pwd, setPwd] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [token, setToken] = useState("");
  const [direction, setDirection] = useState(0);
  const [piloteState, setPiloteState] = useState("No Pilot");
  const [tack, setTack] = useState(false);
  const [wind, setWind] = useState(false);
  // const [reload, setReload] = useState(0);

  let login = "";
  let pwd = "";
  let ssl = false;
  let ipAddress = "";
  // let token = "";
  let baseUrl = `http${ssl ? "s" : ""}://10.10.10.1:3000/signalk/v1`;
  let baseWsUrl = `ws://10.10.10.1:3000/signalk/v1`;

  const stateString = {
    auto: `Heading to ${direction}`,
    standby: "You have the helm",
    wind: "Follow the wind",
    route: "Heading to waypoint",
  };

  const getData = async () => {
    console.log("getData");
    let valueJson;
    try {
      const value = await AsyncStorage.getItem("UserData");
      if (value !== null) {
        valueJson = JSON.parse(value);
        console.log("valueJson");
        console.log(valueJson);
        startApp(valueJson);
      } else {
        navigation.navigate("Settings");
      }
    } catch (e) {
      navigation.navigate("Settings");
    }
    startApp(valueJson);
  };

  function startApp(valueJson) {
    //  login: login,
    //     pwd: pwd,
    //     ipAddress: ipAddress,
    //     ssl: ssl,
    //     tacking: tack,
    //     wind: wind,

    console.log("startApp");
    login = valueJson.login;
    console.log("wind");
    ssl = valueJson.ssl;
    setTack(valueJson.tack);
    setWind(valueJson.wind);
    pwd = valueJson.pwd;
    ipAddress = valueJson.ipAddress;
    baseUrl = `http${ssl ? "s" : ""}://${ipAddress}/signalk/v1`;
    let baseWsUrl = `ws://${ipAddress}/signalk/v1`;
    console.log(baseUrl);
    console.log("renders");
    // setReload(reload + 1);
    // console.log(reload);
    RenderAction();
    RenderTacking();
    connectSK();
  }

  function connectSK() {
    fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: login,
        password: pwd,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        if (json.token) {
          setIsConnected(true);
          setToken(json.token);
          WSconnect();
        }
      })
      .catch((error) => {
        console.log(error);
        Alert.alert("Error:", error.message);
      });
  }

  function SetState(value) {
    setSending(true);
    console.log(token);
    // /signalk/v1/ api / vessels / self / steering / autopilot / state;
    fetch(`${baseUrl}/api/vessels/self/steering/autopilot/state`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ value: value }),
    })
      .then((response) => response.json())
      .then((json) => {
        Alert.alert(`${value} : ${json.state}, ${stateString[value]}`);
        setSending(true);
      })
      .catch((error) => {
        Alert.alert("Error:", error.message);
      });
  }

  function Tack(value) {
    setSending(true);
    console.log(`${baseUrl}/api/vessels/self/steering/autopilot/actions/tack`);
    fetch(`${baseUrl}/api/vessels/self/steering/autopilot/actions/tack`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ value: value }),
    })
      .then((response) => response.json())
      .then((json) => {
        Alert.alert(`${value} : ${json.state}`);
        setSending(false);
      })
      .catch((error) => {
        Alert.alert("Error:", error.message);
      });
  }

  function adjustHeading(value) {
    setSending(true);
    console.log(
      `${baseUrl}/api/vessels/self/steering/autopilot/actions/adjustHeading`
    );
    fetch(
      `${baseUrl}/api/vessels/self/steering/autopilot/actions/adjustHeading`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ value: value }),
      }
    )
      .then((response) => response.json())
      .then((json) => {
        Alert.alert(`${value} : ${json.state}`);
        setDirection(value);
        setSending(false);
      })
      .catch((error) => {
        console.log(error);
        Alert.alert("Error:", error.message);
      });
  }

  function WSconnect() {
    console.log(baseWsUrl);
    let ws = new WebSocket(`${baseWsUrl}/stream?subscribe=none`);
    ws.onopen = () => {
      let subscriptionObject = {
        context: "vessels.self",
        subscribe: [
          {
            path: "steering.autopilot.state",
            format: "delta",
            minPeriod: 900,
          },
          {
            path: "navigation.headingMagnetic",
            format: "delta",
            minPeriod: 1500,
          },
          {
            path: "navigation.headingTrue",
            format: "delta",
            minPeriod: 1500,
          },
          {
            path: "environment.wind.angleApparent",
            format: "delta",
            minPeriod: 900,
          },
          {
            path: "environment.wind.angleTrueWater",
            format: "delta",
            minPeriod: 900,
          },
          {
            path: "notifications.autopilot.*",
            format: "delta",
            minPeriod: 200,
          },
        ],
      };
      setWsConnected(true);
      let subscriptionMessage = JSON.stringify(subscriptionObject);
      ws.send(subscriptionMessage);
    };

    ws.onmessage = (e) => {
      var yo = JSON.parse(e.data);

      if (yo.updates != null) {
        let updates = yo.updates[0];
        // console.log(updates);
        if (updates.values[0].path == "steering.autopilot.state") {
          // console.log("state est ", updates.values[0].value);
          setPiloteState(updates.values[0].value);
        }
        if (updates.values[0].path == "navigation.headingMagnetic") {
          setDirection(Math.round(updates.values[0].value * (180 / Math.PI)));
        }
        if (updates.values[0].path.includes("notifications.autopilot")) {
        }
      }
    };

    ws.onerror = (e) => {
      setWsConnected(false);
      Alert.alert("Error:", e.message);
    };

    ws.onclose = (e) => {
      setWsConnected(false);
      setPiloteState("No Pilot");
      // console.log(e.code, e.reason);
    };
  }

  const zoomIconRef = React.useRef();

  const WifiIcon = (props) => {
    return wsConnected ? (
      <Icon {...props} name="wifi-outline" fill="#24DF98" />
    ) : (
      <Icon
        {...props}
        name="wifi-off-outline"
        fill="#FC4173"
        onPress={() => WSconnect()}
      />
    );
  };

  const SendingIcon = (props) => {
    return isConnected ? (
      <Icon
        {...props}
        name="person-done-outline"
        fill="#24DF98"
        onPress={() => connectSK()}
      />
    ) : (
      <Icon
        {...props}
        name="person-delete-outline"
        fill="#FC4173"
        onPress={() => connectSK()}
      />
    );
  };
  const NightIcon = (props) => {
    return themeContext.theme == "light" ? (
      <Icon
        {...props}
        status="primary"
        name="moon-outline"
        onPress={themeContext.toggleTheme}
      />
    ) : (
      <Icon
        {...props}
        status="primary"
        name="sun-outline"
        onPress={themeContext.toggleTheme}
      />
    );
  };

  const renderZoomIcon = (props) => {
    return sending ? (
      <Icon
        {...props}
        name="loader-outline"
        ref={zoomIconRef}
        animation="zoom"
        fill="#24DF98"
      />
    ) : (
      <Icon
        {...props}
        name="wifi-off-outline"
        ref={zoomIconRef}
        animation="zoom"
        fill="#FC4173"
      />
    );
  };

  function RenderTacking() {
    return (
      <>
        {tack ? (
          <Layout style={styles.containerRowFlexBetween}>
            <Layout style={styles.layoutleft} level="1">
              <Button status="danger" onPress={() => Tack("port")}>
                {"  "}PORT{"  "}
              </Button>
            </Layout>
            <Layout style={styles.layout} level="1">
              <Text status="primary">TACK</Text>
            </Layout>
            <Layout style={styles.layoutright} level="1">
              <Button status="success" onPress={() => Tack("starboard")}>
                STARBORD
              </Button>
            </Layout>
          </Layout>
        ) : (
          <Layout style={styles.containerRowFlexBetween}></Layout>
        )}
      </>
    );
    // if (tack) {
    //   return (

    //   );
    // } else {
    //   return null;
    // }
  }

  function RenderAction() {
    return (
      <>
        {wind ? (
          <ButtonGroup status="primary">
            <Button onPress={() => SetState("auto")}>AUTO</Button>
            <Button onPress={() => SetState("wind")}>WIND</Button>
            <Button onPress={() => SetState("route")}>TRACK</Button>
            <Button onPress={() => SetState("standby")}>STANDBY</Button>
          </ButtonGroup>
        ) : (
          <ButtonGroup status="primary">
            <Button onPress={() => SetState("auto")}>AUTO</Button>
            <Button onPress={() => SetState("route")}>TRACK</Button>
            <Button onPress={() => SetState("standby")}>STANDBY</Button>
          </ButtonGroup>
        )}
      </>
    );
  }

  const renderRightActions = () => (
    <React.Fragment>
      <TopNavigationAction icon={WifiIcon} onPress={() => connectSK()} />
      <TopNavigationAction icon={SendingIcon} />
    </React.Fragment>
  );
  const renderLeftActions = () => (
    <React.Fragment>
      <TopNavigationAction icon={NightIcon} />
    </React.Fragment>
  );

  useFocusEffect(
    React.useCallback(() => {
      getData();

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );
  return (
    <SafeAreaView
      style={
        themeContext.theme === "light"
          ? styles.lightdroidSafeArea
          : styles.darkdroidSafeArea
      }
    >
      <TopNavigation
        status="primary"
        title="PILOT SK"
        alignment="center"
        accessoryRight={renderRightActions}
        accessoryLeft={renderLeftActions}
      />
      <Layout style={styles.container}></Layout>
      <Layout style={styles.container}>
        <Layout style={styles.layout} level="1">
          <Text style={styles.text} category="h2" status="primary">
            {direction}°
          </Text>
          <Text style={styles.text} category="h3" status="primary">
            {piloteState}
          </Text>
        </Layout>
      </Layout>
      <Layout style={styles.container}>
        <Text>{wind}</Text>
      </Layout>
      <Layout style={styles.container}>
        <Layout style={styles.layout} level="1">
          <RenderAction></RenderAction>
        </Layout>
      </Layout>
      <Layout style={styles.containerRowFlexBetween}>
        <Layout style={styles.layout} level="1">
          <Button status="basic" onPress={() => adjustHeading(10)}>
            +10
          </Button>
        </Layout>
        <Layout style={styles.layout} level="1">
          <Button status="basic" onPress={() => adjustHeading(1)}>
            +1
          </Button>
        </Layout>
        <Layout style={styles.layout} level="1">
          <Button status="basic" onPress={() => adjustHeading(-1)}>
            -1
          </Button>
        </Layout>
        <Layout style={styles.layout} level="1">
          <Button status="basic" onPress={() => adjustHeading(-10)}>
            -10
          </Button>
        </Layout>
      </Layout>
      <Layout style={styles.container}></Layout>
      <RenderTacking></RenderTacking>
      <Layout style={styles.container}></Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  layout: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  layoutright: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  layoutleft: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  containerRow: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  containerRowFlexBetween: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  actionBtn: {
    padding: 6,
    margin: 2,
    borderRadius: 4,
  },
  connectBtn: {
    padding: 6,
    margin: 2,
    borderRadius: 4,
  },
  directionBtn: {
    padding: 6,
    margin: 2,
    borderRadius: 4,
  },
  textcenter: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  text: {},

  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  divider: {},
  lightdroidSafeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 20 : 0,
    backgroundColor: "#FFCB00",
  },
  darkdroidSafeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 20 : 0,
    backgroundColor: "#003399",
  },
});
