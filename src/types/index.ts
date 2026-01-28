<<<<<<< HEAD
/**
 * 学生状态常量
 */
export const StudentStatus = {
  NORMAL: 'normal',       // 正常
  ABSENT: 'absent',       // 缺考
  CHEATING: 'cheating'    // 作弊
} as const;

/**
 * 学生状态类型
 */
export type StudentStatus = typeof StudentStatus[keyof typeof StudentStatus];

/**
 * 单科成绩接口
 */
export interface Score {
  subject: string;         // 科目名称
  score: number | null;    // 分数（null表示缺考）
  fullScore: number;       // 满分
  rank?: number;           // 排名（班级内）
  gradeRank?: number;      // 年级排名
}

/**
 * 学生接口
 */
export interface Student {
  id: string;              // 学号
  name: string;            // 姓名
  className?: string;      // 班级
  scores: Score[];         // 各科成绩
  totalScore: number;      // 总分
  rank?: number;           // 总分排名（班级内）
  gradeRank?: number;      // 年级排名
  status: StudentStatus;   // 状态
  nickname?: string;       // 昵称（可编辑）
}

/**
 * 考试配置接口
 */
export interface ExamConfig {
  subjects: string[];                      // 科目列表
  fullScores: Record<string, number>;      // 各科满分
  passLine: number;                        // 单科及格线（百分比，如60表示60%）
  excellentLine: number;                   // 单科优秀线（百分比，如90表示90%）
  totalFullScore: number;                  // 总分满分
  totalPassScore: number;                  // 总分及格线
  totalExcellentScore: number;             // 总分优秀线
}

/**
 * 考试记录接口
 */
export interface ExamRecord {
  id: string;              // 考试ID
  name: string;            // 考试名称
  date: string;            // 考试日期（ISO格式）
  className?: string;      // 班级名称（如果是单班级考试）
  students: Student[];     // 学生列表
  configs: ExamConfig;     // 考试配置
  isGradeMode: boolean;    // 是否为年级模式
}

/**
 * 单科统计接口
 */
export interface SubjectStat {
  subject: string;         // 科目
  avgScore: number;        // 平均分
  passRate: number;        // 及格率
  excellentRate: number;   // 优秀率
  failRate: number;        // 不及格率
  fullScoreCount: number;  // 满分人数
  maxScore: number;        // 最高分
  minScore: number;        // 最低分
  passScore: number;       // 及格线分数
  excellentScore: number;  // 优秀线分数
}

/**
 * 统计数据接口
 */
export interface Statistics {
  totalStudents: number;       // 总人数
  attendedStudents: number;    // 参考人数
  absentStudents: number;      // 缺考人数
  avgScore: number;            // 平均分
  passRate: number;            // 及格率
  excellentRate: number;       // 优秀率
  failRate: number;            // 不及格率
  fullScoreCount: number;      // 满分人数
  maxScore: number;            // 最高分
  minScore: number;            // 最低分
  subjectStats: SubjectStat[]; // 各科统计
}

/**
 * 班级统计接口
 */
export interface ClassStatistics extends Statistics {
  className: string;       // 班级名称
  studentCount: number;    // 班级人数
}

/**
 * 临界生接口
 */
export interface CriticalStudent {
  student: Student;        // 学生信息
  gap: number;             // 差距分数
  type: 'pass' | 'excellent'; // 临界类型
}

/**
 * 分数段分布接口
 */
export interface ScoreDistribution {
  range: string;           // 分数段（如"90-100"）
  count: number;           // 人数
  percentage: number;      // 占比
}

/**
 * 趋势数据点接口
 */
export interface TrendDataPoint {
  examName: string;        // 考试名称
  date: string;            // 日期
  score: number;           // 分数
  rank?: number;           // 排名
}

/**
 * 学生成长趋势接口
 */
export interface StudentTrend {
  student: Student;                        // 学生信息
  totalScoreTrend: TrendDataPoint[];      // 总分趋势
  rankTrend: TrendDataPoint[];            // 排名趋势
  subjectTrends: Record<string, TrendDataPoint[]>; // 各科趋势
}

/**
 * 报告配置接口
 */
export interface ReportConfig {
  includeCharts: boolean;      // 是否包含图表
  includeAnalysis: boolean;    // 是否包含分析建议
  reportType: 'individual' | 'class' | 'grade'; // 报告类型
}

/**
 * 科目配置项接口
 */
export interface SubjectConfig {
  id: string;              // 唯一标识
  name: string;            // 科目名称
  fullScore: number;       // 满分
  isRequired: boolean;     // 是否必修（语文、数学、英语不可删除）
  order: number;           // 排序序号
}

/**
 * 科目模板配置接口
 */
export interface SubjectTemplateConfig {
  subjects: SubjectConfig[];
  lastModified: string;    // 最后修改时间
}
=======
export type SchoolStage = "kindergarten" | "primary" | "middle"

export interface StyleOption {
  value: string
  label: string
  tooltip: string
}

export interface Student {
  id: number
  name: string
  gender: string
  tags: string[]
  comment: string
  isGenerating?: boolean
  customStyle?: string
  showGenderSelect?: boolean
}

export const stylesByStage: Record<SchoolStage, StyleOption[]> = {
  kindergarten: [
    {
      value: "lively-horse",
      label: "活泼小马 (马年限定)",
      tooltip: "结合2026马年元素，把孩子比作可爱的'小马驹'，活泼充满童趣。",
    },
    {
      value: "warm-gentle",
      label: "亲切温柔 (标准版)",
      tooltip: "像妈妈一样的口吻，语气柔和，充满爱意和包容。",
    },
    {
      value: "detail-narrative",
      label: "细节叙事",
      tooltip: "侧重描述生活细节和具体画面，不会空洞地表扬。",
    },
  ],
  primary: [
    {
      value: "dragon-horse",
      label: "龙马精神",
      tooltip: "引用'一马当先'、'龙马精神'等成语，充满能量地给予评语。",
    },
    {
      value: "enthusiastic",
      label: "热情鼓励",
      tooltip: "阳光积极，多用感叹句，侧重挖掘优点和自信心。",
    },
    {
      value: "poetic",
      label: "诗意文采",
      tooltip: "引用恰当的古诗文或名言，评语内容优美典雅。",
    },
  ],
  middle: [
    {
      value: "galloping",
      label: "策马扬鞭",
      tooltip: "引用'以梦为马'意象，鼓励学生在青春旷野全力奔跑。",
    },
    {
      value: "friendly-mentor",
      label: "亦师亦友",
      tooltip: "平等对话，尊重个性，像与学生一样真诚交流。",
    },
    {
      value: "rigorous",
      label: "严谨治学",
      tooltip: "干练客观，侧重评价学习态度和思维能力，直击要害。",
    },
  ],
}
>>>>>>> b56face1a95cd2b8af20261f4b81aced32df9c5e
