// In-memory demo store for when Supabase credentials are not yet configured

export interface DemoProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  framework: string | null;
  language: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DemoFile {
  id: string;
  project_id: string;
  file_path: string;
  content: string;
  file_hash: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface DemoTask {
  id: string;
  project_id: string;
  task_description: string;
  status: string;
  execution_plan?: any;
  result?: any;
  created_at: string;
  completed_at?: string;
}

export interface DemoTokenUsage {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  estimated_cost: number;
  created_at: string;
}

export interface DemoBenchmarkRun {
  id: string;
  user_id: string;
  task_name: string;
  workflow_type: string;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  task_success: boolean;
  test_results: any;
  execution_time: number;
  created_at: string;
}

const DEFAULT_DEMO_PROJECT: DemoProject = {
  id: "demo-project-001",
  user_id: "demo-user-id",
  name: "Student Management System",
  description: "Full-stack student portal with CRUD operations, course catalog, and gradebook.",
  framework: "Next.js",
  language: "TypeScript",
  status: "active",
  created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_DEMO_FILES: DemoFile[] = [
  {
    id: "f-1",
    project_id: "demo-project-001",
    file_path: "src/app/page.tsx",
    content: `export default function StudentDashboard() {\n  return (\n    <main className="p-8">\n      <h1 className="text-2xl font-bold">Student Management System</h1>\n      <p className="text-gray-500">Welcome to the student portal.</p>\n    </main>\n  );\n}`,
    file_hash: "hash1",
    file_size: 210,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "f-2",
    project_id: "demo-project-001",
    file_path: "src/types/student.ts",
    content: `export interface Student {\n  id: string;\n  name: string;\n  email: string;\n  enrollmentDate: string;\n  gpa: number;\n}`,
    file_hash: "hash2",
    file_size: 130,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "f-3",
    project_id: "demo-project-001",
    file_path: "src/lib/api.ts",
    content: `export async function getStudents() {\n  return [\n    { id: "1", name: "Alice Johnson", email: "alice@example.com", gpa: 3.8 },\n    { id: "2", name: "Bob Smith", email: "bob@example.com", gpa: 3.5 },\n  ];\n}`,
    file_hash: "hash3",
    file_size: 220,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_DEMO_TASKS: DemoTask[] = [
  {
    id: "task-001",
    project_id: "demo-project-001",
    task_description: "Create student registration form with input validation and state management",
    status: "completed",
    result: {
      totalTokenUsage: { inputTokens: 1250, outputTokens: 480, cachedTokens: 320, totalTokens: 1730 },
      tokenSavings: 68,
      totalCost: 0.00028,
    },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 4 + 18000).toISOString(),
  },
  {
    id: "task-002",
    project_id: "demo-project-001",
    task_description: "Add dark mode toggle and theme provider",
    status: "completed",
    result: {
      totalTokenUsage: { inputTokens: 890, outputTokens: 340, cachedTokens: 250, totalTokens: 1230 },
      tokenSavings: 72,
      totalCost: 0.00019,
    },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 2 + 12000).toISOString(),
  },
];

const DEFAULT_DEMO_TOKEN_USAGE: DemoTokenUsage[] = [
  {
    id: "u-1",
    user_id: "demo-user-id",
    project_id: "demo-project-001",
    task_id: "task-001",
    model_name: "gemini-2.0-flash",
    input_tokens: 1250,
    output_tokens: 480,
    cached_tokens: 320,
    estimated_cost: 0.00028,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "u-2",
    user_id: "demo-user-id",
    project_id: "demo-project-001",
    task_id: "task-002",
    model_name: "gemini-2.0-flash",
    input_tokens: 890,
    output_tokens: 340,
    cached_tokens: 250,
    estimated_cost: 0.00019,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_DEMO_BENCHMARKS: DemoBenchmarkRun[] = [
  {
    id: "b-1",
    user_id: "demo-user-id",
    task_name: "Create React Component",
    workflow_type: "baseline",
    model_name: "gemini-2.0-flash",
    input_tokens: 4200,
    output_tokens: 1250,
    cached_tokens: 0,
    task_success: true,
    test_results: { tests_passed: 3 },
    execution_time: 3200,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "b-2",
    user_id: "demo-user-id",
    task_name: "Create React Component",
    workflow_type: "optimized",
    model_name: "gemini-2.0-flash",
    input_tokens: 1150,
    output_tokens: 480,
    cached_tokens: 0,
    task_success: true,
    test_results: { tests_passed: 3 },
    execution_time: 1150,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "b-3",
    user_id: "demo-user-id",
    task_name: "Fix Login Bug",
    workflow_type: "baseline",
    model_name: "gemini-2.0-flash",
    input_tokens: 6800,
    output_tokens: 1800,
    cached_tokens: 0,
    task_success: true,
    test_results: { tests_passed: 4 },
    execution_time: 4800,
    created_at: new Date().toISOString(),
  },
  {
    id: "b-4",
    user_id: "demo-user-id",
    task_name: "Fix Login Bug",
    workflow_type: "optimized",
    model_name: "gemini-2.0-flash",
    input_tokens: 1850,
    output_tokens: 520,
    cached_tokens: 0,
    task_success: true,
    test_results: { tests_passed: 4 },
    execution_time: 1420,
    created_at: new Date().toISOString(),
  },
];

class DemoStore {
  projects: DemoProject[] = [DEFAULT_DEMO_PROJECT];
  files: DemoFile[] = [...DEFAULT_DEMO_FILES];
  tasks: DemoTask[] = [...DEFAULT_DEMO_TASKS];
  tokenUsage: DemoTokenUsage[] = [...DEFAULT_DEMO_TOKEN_USAGE];
  benchmarks: DemoBenchmarkRun[] = [...DEFAULT_DEMO_BENCHMARKS];

  getProjects(userId: string) {
    return this.projects;
  }

  getProject(id: string) {
    return this.projects.find((p) => p.id === id);
  }

  createProject(data: Partial<DemoProject>) {
    const project: DemoProject = {
      id: crypto.randomUUID(),
      user_id: data.user_id || "demo-user-id",
      name: data.name || "Untitled Project",
      description: data.description || null,
      framework: data.framework || "Next.js",
      language: data.language || "TypeScript",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.projects.unshift(project);
    return project;
  }

  deleteProject(id: string) {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.files = this.files.filter((f) => f.project_id !== id);
    return true;
  }

  getFiles(projectId: string) {
    return this.files.filter((f) => f.project_id === projectId);
  }

  saveFile(projectId: string, filePath: string, content: string) {
    const existing = this.files.find((f) => f.project_id === projectId && f.file_path === filePath);
    if (existing) {
      existing.content = content;
      existing.file_size = Buffer.byteLength(content);
      existing.updated_at = new Date().toISOString();
      return existing;
    }
    const newFile: DemoFile = {
      id: crypto.randomUUID(),
      project_id: projectId,
      file_path: filePath,
      content,
      file_hash: crypto.randomUUID(),
      file_size: Buffer.byteLength(content),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.files.push(newFile);
    return newFile;
  }

  addTask(task: DemoTask) {
    this.tasks.unshift(task);
    return task;
  }

  addTokenUsage(usage: DemoTokenUsage) {
    this.tokenUsage.unshift(usage);
    return usage;
  }

  addBenchmark(run: DemoBenchmarkRun) {
    this.benchmarks.unshift(run);
    return run;
  }
}

// Global singleton across server invocations
declare global {
  // eslint-disable-next-line no-var
  var __demoStore: DemoStore | undefined;
}

export const demoStore = global.__demoStore || (global.__demoStore = new DemoStore());
