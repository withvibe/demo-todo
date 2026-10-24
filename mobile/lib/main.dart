import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() => runApp(const TodoApp());

const _accent = Color(0xFF4F46E5);
const _bg = Color(0xFFF6F7F9);
const _ink = Color(0xFF111827);
const _inkSoft = Color(0xFF6B7280);

/// The app is served at mobile-<short>.app.withvibe.dev and the API at
/// api-<short>.app.withvibe.dev. Derive the API base from our own host.
String apiBase() {
  final uri = Uri.base; // e.g. https://mobile-xxxx.app.withvibe.dev/
  final host = uri.host;
  if (host == 'localhost' || host.startsWith('127.')) {
    return 'http://localhost:8080';
  }
  final apiHost = host.replaceFirst(RegExp(r'^[^.-]+-'), 'api-');
  return '${uri.scheme}://$apiHost';
}

class Todo {
  final int id;
  final String title;
  final bool done;
  final String priority;
  final String? assignee;
  Todo({
    required this.id,
    required this.title,
    required this.done,
    required this.priority,
    this.assignee,
  });
  factory Todo.fromJson(Map<String, dynamic> j) => Todo(
        id: j['id'] as int,
        title: j['title'] as String,
        done: j['done'] as bool,
        priority: (j['priority'] ?? 'medium') as String,
        assignee: j['assignee'] as String?,
      );
}

class Api {
  final String base = apiBase();

  Future<List<Todo>> list() async {
    final r = await http.get(Uri.parse('$base/todos'));
    final data = jsonDecode(r.body) as List<dynamic>;
    return data.map((e) => Todo.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> create(String title) async {
    await http.post(
      Uri.parse('$base/todos'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'title': title, 'assignee': 'Me'}),
    );
  }

  Future<void> setDone(int id, bool done) async {
    await http.patch(
      Uri.parse('$base/todos/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'done': done}),
    );
  }

  Future<void> remove(int id) async {
    await http.delete(Uri.parse('$base/todos/$id'));
  }
}

class TodoApp extends StatelessWidget {
  const TodoApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Todo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: _accent),
        scaffoldBackgroundColor: _bg,
      ),
      home: const TodoHome(),
    );
  }
}

class TodoHome extends StatefulWidget {
  const TodoHome({super.key});
  @override
  State<TodoHome> createState() => _TodoHomeState();
}

class _TodoHomeState extends State<TodoHome> {
  final api = Api();
  final controller = TextEditingController();
  List<Todo> todos = [];
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    refresh();
  }

  Future<void> refresh() async {
    try {
      final list = await api.list();
      setState(() {
        todos = list;
        loading = false;
        error = null;
      });
    } catch (e) {
      setState(() {
        loading = false;
        error = '$e';
      });
    }
  }

  Future<void> add() async {
    final text = controller.text.trim();
    if (text.isEmpty) return;
    controller.clear();
    await api.create(text);
    refresh();
  }

  @override
  Widget build(BuildContext context) {
    final open = todos.where((t) => !t.done).length;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.only(top: kIsWeb ? 44 : 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('My tasks',
                        style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: _ink)),
                    const SizedBox(height: 2),
                    Text(
                      loading ? 'Loading…' : error != null ? 'API: $error' : '$open open · ${todos.length} total',
                      style: TextStyle(
                          fontSize: 14,
                          color: error != null ? const Color(0xFFB91C1C) : _inkSoft),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: refresh,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: todos.length,
                    itemBuilder: (_, i) => _tile(todos[i]),
                  ),
                ),
              ),
              _composer(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _tile(Todo t) {
    final pri = {
      'high': const Color(0xFFB91C1C),
      'medium': const Color(0xFFB45309),
      'low': const Color(0xFF6B7280),
    }[t.priority] ?? _inkSoft;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: ListTile(
        leading: Checkbox(
          value: t.done,
          activeColor: _accent,
          onChanged: (v) async {
            await api.setDone(t.id, v ?? false);
            refresh();
          },
        ),
        title: Text(
          t.title,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: t.done ? _inkSoft : _ink,
            decoration: t.done ? TextDecoration.lineThrough : null,
          ),
        ),
        subtitle: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                  color: pri.withValues(alpha: .12), borderRadius: BorderRadius.circular(999)),
              child: Text(t.priority,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: pri)),
            ),
            if (t.assignee != null) ...[
              const SizedBox(width: 8),
              Text(t.assignee!, style: const TextStyle(fontSize: 12, color: _inkSoft)),
            ],
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.close, size: 18, color: _inkSoft),
          onPressed: () async {
            await api.remove(t.id);
            refresh();
          },
        ),
      ),
    );
  }

  Widget _composer() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              onSubmitted: (_) => add(),
              decoration: InputDecoration(
                hintText: 'Add a task…',
                filled: true,
                fillColor: _bg,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ),
          const SizedBox(width: 10),
          FilledButton(
            onPressed: add,
            style: FilledButton.styleFrom(
                backgroundColor: _accent,
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16)),
            child: const Icon(Icons.add),
          ),
        ],
      ),
    );
  }
}
