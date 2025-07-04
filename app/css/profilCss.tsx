import { StyleSheet } from "react-native";

const profilStyles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#1A9EAA",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    color: "#fff",
    marginTop: 8,
    textAlign: "center",
  },
  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 15,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#181818",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
    textAlign: "center",
  },
  editIcon: {
    marginLeft: 8,
    fontSize: 20,
    color: "#1A9EAA",
  },
  button: {
    backgroundColor: "#1A9EAA",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    alignSelf: "center",
    width: 200,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

export default profilStyles;