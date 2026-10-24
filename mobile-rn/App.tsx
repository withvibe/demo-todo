import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PhoneFrame } from "./src/components/PhoneFrame";
import {
  createTodo,
  listTodos,
  removeTodo,
  setDone,
  type Todo,
} from "./src/api";

const accent = "#4F46E5";
const bg = "#F6F7F9";
const ink = "#111827";
const inkSoft = "#6B7280";
const line = "#E5E7EB";

const PRIORITY_COLOR: Record<string, string> = {
  high: "#B91C1C",
  medium: "#B45309",
  low: "#6B7280",
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");

  async function refresh() {
    try {
      setTodos(await listTodos());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, []);

  async function add() {
    const title = text.trim();
    if (!title) return;
    setText("");
    await createTodo(title);
    refresh();
  }

  const open = todos.filter((t) => !t.done).length;

  return (
    <PhoneFrame>
      <View style={styles.app}>
        <View style={styles.header}>
          <Text style={styles.title}>My tasks</Text>
          <Text style={[styles.sub, error ? styles.err : null]}>
            {loading
              ? "Loading…"
              : error
                ? `API: ${error}`
                : `${open} open · ${todos.length} total`}
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={accent} />
          </View>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(t) => String(t.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Pressable
                  onPress={async () => {
                    await setDone(item.id, !item.done);
                    refresh();
                  }}
                  style={[styles.check, item.done && styles.checkOn]}
                >
                  {item.done && <Text style={styles.checkMark}>✓</Text>}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.rowTitle, item.done && styles.rowDone]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <View style={styles.meta}>
                    <View
                      style={[
                        styles.pill,
                        { backgroundColor: (PRIORITY_COLOR[item.priority] ?? inkSoft) + "22" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          { color: PRIORITY_COLOR[item.priority] ?? inkSoft },
                        ]}
                      >
                        {item.priority}
                      </Text>
                    </View>
                    {item.assignee ? (
                      <Text style={styles.assignee}>{item.assignee}</Text>
                    ) : null}
                  </View>
                </View>
                <Pressable
                  onPress={async () => {
                    await removeTodo(item.id);
                    refresh();
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.remove}>✕</Text>
                </Pressable>
              </View>
            )}
          />
        )}

        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={add}
            placeholder="Add a task…"
            placeholderTextColor={inkSoft}
            style={styles.input}
            returnKeyType="done"
          />
          <Pressable style={styles.addBtn} onPress={add}>
            <Text style={styles.addBtnText}>＋</Text>
          </Pressable>
        </View>
        <StatusBar style="dark" />
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: "700", color: ink },
  sub: { marginTop: 2, fontSize: 14, color: inkSoft },
  err: { color: "#B91C1C" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: line,
    padding: 14,
    marginBottom: 8,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: accent, borderColor: accent },
  checkMark: { color: "#fff", fontSize: 14, fontWeight: "700" },
  rowTitle: { fontSize: 15, fontWeight: "600", color: ink },
  rowDone: { textDecorationLine: "line-through", color: inkSoft },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: "700" },
  assignee: { fontSize: 12, color: inkSoft },
  remove: { color: inkSoft, fontSize: 16, paddingHorizontal: 4 },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: line,
  },
  input: {
    flex: 1,
    backgroundColor: bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: ink,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontSize: 22, fontWeight: "700", lineHeight: 24 },
});
