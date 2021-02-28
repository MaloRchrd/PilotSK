import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import {
  Divider,
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  TouchableWithoutFeedback,
  Input,
  Button,
  CheckBox,
  List,
  ListItem,
} from "@ui-kitten/components";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../assets/theme/theme-context";

// import { storage } from "../storage/asycstorage.component";

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const AlertIcon = (props) => <Icon {...props} name="alert-circle-outline" />;

export const SettingScreen = ({ navigation }) => {
  const navigateBack = () => {
    navigation.goBack();
  };

  const [login, setLogin] = React.useState("");
  const [pwd, setPwd] = React.useState("");
  const [ipAddress, setIpAddress] = React.useState("");
  const [saveString, setSaveString] = React.useState("Save");
  const [testString, setTestString] = React.useState("Test connection");
  const [ssl, setSsl] = React.useState(false);
  const [tack, setTack] = React.useState(false);
  const [wind, setWind] = React.useState(false);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("UserData");
      if (value !== null) {
        let valueJson = JSON.parse(value);
        console.log(valueJson);
        console.log(valueJson.login);
        if (valueJson.login) {
          setLogin(valueJson.login);
        }
        if (valueJson.pwd) {
          setPwd(valueJson.pwd);
        }
        if (valueJson.ipAddress) {
          setIpAddress(valueJson.ipAddress);
        }
      }
    } catch (e) {
      // error reading value
    }
  };

  React.useEffect(() => {
    // write your code here, it's like componentWillMount
    getData();
    setSaveString("SAVE");
  }, []);

  const storeData = async () => {
    setSaveString("SAVING...");
    console.log("tack");
    console.log(tack);
    try {
      const jsonValue = JSON.stringify({
        login: login,
        pwd: pwd,
        ipAddress: ipAddress,
        ssl: ssl,
        tack: tack,
        wind: wind,
      });
      await AsyncStorage.setItem("UserData", jsonValue);
    } catch (e) {
      Alert.alert(e);
      // saving error
    }
    setTimeout(function () {
      setSaveString("SAVED");
    }, 1000);
  };
  const themeContext = React.useContext(ThemeContext);
  const renderLeftActions = () => (
    <React.Fragment>
      <TopNavigationAction icon={NightIcon} />
    </React.Fragment>
  );

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

  useFocusEffect(
    React.useCallback(() => {
      setSaveString("SAVE");

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );

  function SaveData() {
    storeData();
  }
  const listData = [
    {
      title: "Tack",
      description: "Tacking functionnality,isn't available in old pilot",
    },
    {
      title: "Wind pilot",
      description: "Follow wind functionnality,isn't available in old pilot",
    },
  ];

  return (
    <SafeAreaView
      style={
        themeContext.theme === "light"
          ? styles.lightdroidSafeArea
          : styles.darkdroidSafeArea
      }
    >
      <TopNavigation
        title="SETTINGS"
        alignment="center"
        accessoryLeft={renderLeftActions}
      />
      <ScrollView
        style={themeContext.theme == "light" ? styles.lightbg : styles.darkbg}
      >
        <Layout
          style={{
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 10,
          }}
        >
          <Layout style={styles.layout}>
            <Text category="h5" status="primary">
              Signal K login
            </Text>
            <Input
              label="Login"
              placeholder="My login"
              caption="Your signal k login"
              value={login}
              captionIcon={AlertIcon}
              onChangeText={(nextValue) => setLogin(nextValue)}
            />
            <Input
              value={pwd}
              label="Password"
              placeholder="My password"
              caption="Your signal K password"
              captionIcon={AlertIcon}
              secureTextEntry={true}
              onChangeText={(nextValue) => setPwd(nextValue)}
            />
          </Layout>
          <Layout style={styles.layoutMT}>
            <Text style={{ paddingBottom: 10 }} category="h5" status="primary">
              Signal K Server
            </Text>
            <Input
              label="Url/IP of signal key serveur"
              placeholder=" EX : 10.10.10.1:3000"
              caption="Your signal k server ip"
              value={ipAddress}
              captionIcon={AlertIcon}
              onChangeText={(nextValue) => setIpAddress(nextValue)}
            />
            <Text
              style={{ paddingBottom: 10, paddingTop: 10 }}
              category="h5"
              status="primary"
            >
              Other Options
            </Text>
            <Layout style={{ textAlign: "left", width: "100%" }}>
              <CheckBox
                style={{
                  marginTop: 5,
                  marginBottom: 5,
                  marginLeft: 10,
                }}
                checked={ssl}
                onChange={(sslChecked) => setSsl(sslChecked)}
              >
                <Text
                  style={{ paddingBottom: 10 }}
                  category="s1"
                  status="primary"
                >
                  {`Do you use https ?`}
                </Text>
              </CheckBox>
              <CheckBox
                style={{
                  marginTop: 5,
                  marginBottom: 5,
                  marginLeft: 10,
                }}
                checked={tack}
                onChange={(tackChecked) => setTack(tackChecked)}
              >
                <Text
                  style={{ paddingBottom: 10 }}
                  category="s1"
                  status="primary"
                >
                  {`Tacking actions`}
                </Text>
              </CheckBox>
              <CheckBox
                style={{
                  marginTop: 5,
                  marginBottom: 5,
                  marginLeft: 10,
                }}
                checked={wind}
                onChange={(windChecked) => setWind(windChecked)}
              >
                <Text
                  style={{ paddingBottom: 10 }}
                  category="s1"
                  status="primary"
                >
                  {`Follow wind action`}
                </Text>
              </CheckBox>
            </Layout>
          </Layout>

          {/* {testString != "testing" ? (
            <Button
              style={styles.btn}
              status="warning"
              onPress={() => connectSK()}
            >
              {testString}
            </Button>
          ) : (
            <Button
              style={styles.btn}
              disabled="true"
              onPress={() => connectSK()}
            >
              {testString}
            </Button>
          )} */}
          {saveString != "Save" ? (
            <Button
              style={styles.btn}
              status="primary"
              onPress={() => SaveData()}
            >
              {saveString}
            </Button>
          ) : (
            <Button status="primary" disabled="true" onPress={() => SaveData()}>
              {saveString}
            </Button>
          )}
        </Layout>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  layout: {
    justifyContent: "center",
    alignItems: "center",
  },
  layoutMT: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  darkbg: {
    backgroundColor: "#003399",
  },
  lightbg: {
    backgroundColor: "#FFCB00",
  },
  btn: {
    marginTop: 20,
    width: "100%",
  },
  blueBg: {},
  yellowBg: {},
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
