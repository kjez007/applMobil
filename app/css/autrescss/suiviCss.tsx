import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const cardMargin = 12;
const nbColumns = 3;
const cardWidth = (screenWidth - (cardMargin * 2 * nbColumns)) / nbColumns;

const suiviStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6fafd",
    flexDirection: "row",
    padding: 0,
  },
  leftPanel: {
    width: 100,
    padding: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  rightPanel: {
    flex: 1,
    padding: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A9EAA",
    marginBottom: 10,
    textAlign: "center",
    marginTop: 0,
  },
  bourseBox: {
    alignItems: "center",
    marginBottom: 12,
    marginTop: 0,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: 0,
  },
  projectCard: {
    width: cardWidth,
    margin: cardMargin,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  columnWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default suiviStyles;