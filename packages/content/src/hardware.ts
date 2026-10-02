import type { FieldSection } from "./types";

const t = String.raw;

export const cpu: FieldSection = {
  slug: "cpu",
  title: "CPU",
  line: "The universal machine at the heart of every computer.",
  intro: [
    "A central processing unit (CPU) is a general-purpose processor that executes instructions in sequence, following the von Neumann architecture. Every personal computer, server, and embedded system uses a CPU to run its programs. CPUs execute billions of instructions per second, with each instruction manipulating data in registers and memory according to a precise instruction set.",
    "The evolution of CPUs has followed Moore's Law: the number of transistors on a chip doubles roughly every two years, steadily increasing computing power. Modern CPUs use multiple cores to execute many instructions in parallel, pipelining to start the next instruction before the current one finishes, and caches to speed access to frequently used data. Despite their flexibility, CPUs are best at sequential, general-purpose computation.",
  ],
  topics: [
    {
      id: "von-neumann-architecture",
      title: "The von Neumann Architecture",
      paragraphs: [
        "In 1945, John von Neumann described the stored-program computer: a machine with memory holding both data and the instructions that operate on it, a control unit that fetches and decodes instructions, and an arithmetic-logic unit (ALU) that carries out the operations. Before this, programmers rewired machines by hand for each new task. The stored program made the computer universal.",
        "The cycle is simple: fetch the instruction from memory, decode it, execute it, and write back any result. By encoding the instruction as a number in memory, the same machine can run any program. This design is so fundamental that every CPU in the world, from the tiniest embedded processor to the fastest supercomputer, still follows it.",
      ],
    },
    {
      id: "instruction-sets",
      title: "Instruction Sets and Architectures",
      paragraphs: [
        "An instruction set is the vocabulary of the machine: the list of operations it can perform. x86 and ARM are the dominant instruction set architectures. x86, created by Intel in 1978, powers most desktop and server computers. ARM, a simpler and more power-efficient design from 1985, dominates mobile phones and embedded systems.",
        "Different architectures optimize for different goals. x86 prioritizes backward compatibility and raw performance. ARM emphasizes energy efficiency. MIPS and PowerPC serve specialized markets. A CPU implements one instruction set by providing circuits to decode each instruction and carry out the operation, so changing the set requires redesigning the chip.",
      ],
    },
    {
      id: "parallel-execution",
      title: "Parallelism: Cores and Pipelining",
      paragraphs: [
        "A single-core CPU processes one instruction at a time, but modern CPUs contain multiple cores, each executing its own instruction stream in parallel. A quad-core CPU can run four independent instruction streams, quadrupling throughput for parallel workloads. The challenge is that not all programs parallelize easily: they must be written to divide work among cores.",
        "Within a single core, pipelining overlaps instruction execution. While the ALU is computing the result of one instruction, the control unit is decoding the next, and memory is fetching the one after that. This keeps the hardware busy, but jumps and data dependencies can stall the pipeline. Speculative execution and branch prediction try to guess what comes next, but modern CPUs have learned that some predictions can leak secrets, a vulnerability that required hardware redesign.",
      ],
    },
    {
      id: "memory-hierarchy",
      title: "Memory and the Cache Hierarchy",
      paragraphs: [
        "Main memory is large but slow; registers are tiny but fast. Caches bridge the gap. An L1 cache (a few dozen kilobytes per core) sits next to the ALU. If data is there, it arrives in one or two cycles. If not, the CPU stalls while waiting for the slower L2 cache, then the even slower L3 cache, then main memory, which can take hundreds of cycles. The job of cache design is to guess which data you will need next and have it ready.",
        "Locality of reference is the key principle: programs tend to reuse the same data and instructions over short time periods. Cache designs exploit temporal locality (hold recently used data) and spatial locality (fetch nearby data too). This is why a program might run 100 times faster by rearranging its data layout: the cache hits more often.",
      ],
    },
  ],
  figures: [
    {
      slug: "john-von-neumann",
      name: "John von Neumann",
      born: "1903",
      died: "1957",
      field: ["Computer Science", "Mathematics", "Physics"],
      contributions: [
        "Described the stored-program architecture that all digital computers still follow: instructions and data in the same memory, with a control unit fetching and executing them in sequence.",
        "Founded game theory and the theory of self-replicating automata.",
        "Worked on the Manhattan Project and the design of EDVAC, the first practical stored-program computer.",
      ],
      quotes: [
        {
          text: "The only way to deal with an error is to go back to the source and fix it there. There is no way to remove an error that was made in the earlier stage: it will haunt you forever.",
          source: "Lecture on 'Computers and the Brain' at Yale University, 1956",
          verified: true,
        },
      ],
    },
    {
      slug: "gordon-moore",
      name: "Gordon Moore",
      born: "1929",
      died: "2023",
      field: ["Electronics", "Engineering"],
      contributions: [
        "Co-founded Intel in 1968 and served as its CEO. Intel became the dominant CPU manufacturer, with x86 processors powering most of the world's computers.",
        "Observed in 1965 that the number of transistors on a chip was doubling every year or two (later refined to every 18–24 months), a prediction known as Moore's Law that has held for six decades.",
        "Pioneered the design and manufacture of silicon integrated circuits as a merchant semiconductor company.",
      ],
      quotes: [
        {
          text: "The future of integrated electronics is the future of electronics itself.",
          source: "Electronics magazine, April 1965",
          verified: true,
        },
      ],
    },
    {
      slug: "sophie-wilson",
      name: "Sophie Wilson",
      born: "1957",
      died: "",
      field: ["Computer Science", "Processor Design"],
      contributions: [
        "Led the design of the ARM instruction set while at Acorn Computers in 1985, creating a simple, efficient architecture that became the standard for mobile and embedded processors.",
        "ARM processors now power over 150 billion devices, from smartphones to IoT sensors.",
        "An advocate for diversity in computing and the importance of elegant design.",
      ],
      quotes: [],
    },
  ],
};

export const gpu: FieldSection = {
  slug: "gpu",
  title: "GPU",
  line: "Thousands of processors in parallel, unleashing massive throughput.",
  intro: [
    "A graphics processing unit (GPU) evolved from the need to render millions of pixels on a screen. Unlike a CPU, which executes a few instructions very quickly, a GPU executes the same instruction on thousands of data elements in parallel. This design was perfect for graphics—transform, shade, and rasterize millions of pixels at once—and decades later proved equally powerful for machine learning and scientific simulation.",
    "A GPU contains hundreds or thousands of cores organized into groups called warps or wavefronts. All cores in a group execute the same instruction on different data, a pattern called single instruction, multiple data (SIMD). The GPU trades CPU flexibility for raw parallel throughput: it can apply the same operation to massive arrays of numbers far faster than a CPU, but only if your problem fits that pattern.",
  ],
  topics: [
    {
      id: "graphics-to-compute",
      title: "From Graphics to General Computation",
      paragraphs: [
        "In the 1990s, GPUs were specialized chips on a graphics card, hardwired to transform 3D vertices, project them onto 2D screen coordinates, and rasterize triangles into pixels. Graphics programmers wrote vertex and pixel shaders—programs that ran on the GPU to control how geometry was transformed and how colors were computed.",
        "Around 2006, GPUs became programmable enough to solve non-graphics problems. NVIDIA released CUDA, allowing programmers to write C-like code that would run on thousands of GPU cores simultaneously. A single GPU could outperform a CPU 10× or 100× on problems like matrix multiplication, if the parallelism fit the data. This sparked GPU adoption in machine learning, physics simulation, and scientific computing.",
      ],
    },
    {
      id: "parallel-architecture",
      title: "Massive Parallelism and Memory Bandwidth",
      paragraphs: [
        "A modern GPU has 5,000 to 100,000 logical processors, far more than a CPU's 8 to 128 cores. They are organized hierarchically: thousands of threads in thread blocks, thread blocks in grids. All threads in a warp (32 or 64 threads) execute the same instruction on different data. If threads in a warp take different control paths (one goes to an if-branch, another to an else), the hardware executes both paths, disabling unused threads—a penalty called divergence.",
        "GPUs tolerate stalls better than CPUs. While some threads wait for memory, others compute, so the GPU stays productive if there are enough threads. This means a GPU can hide latency with parallelism: use 10,000 threads instead of 1,000, and waits disappear in the noise. The tradeoff is memory: each thread needs its own registers and local memory, and a GPU's memory hierarchy is different from a CPU's.",
      ],
    },
    {
      id: "tensor-operations",
      title: "Tensor Cores and Matrix Operations",
      paragraphs: [
        "Modern GPUs include specialized circuits called tensor cores that multiply two 4×4 matrices and accumulate the result in a single instruction. Because matrix multiplication is the core operation in deep learning, tensor cores give 10× or 20× speedup on neural networks compared to general SIMD code.",
        "This specialization hints at the future: as problem domains become clear, hardware adapts. GPUs started as rasterizers, became general SIMD processors, and now sport matrix engines. The GPU's flexibility still beats a fixed-function accelerator, but the trend is clear: squeeze the most performance from the parallelism you have.",
      ],
    },
  ],
  figures: [
    {
      slug: "david-kirk",
      name: "David Kirk",
      born: "1962",
      died: "",
      field: ["Computer Science", "GPU Architecture"],
      contributions: [
        "Led the design of NVIDIA's CUDA programming model, released in 2006, which made GPU compute accessible to programmers beyond graphics.",
        "Helped establish NVIDIA as a leader in AI and machine learning hardware, not just graphics.",
        "Contributed to the design of GPU architectures that scaled from graphics to general-purpose compute.",
      ],
      quotes: [],
    },
    {
      slug: "jen-hsun-huang",
      name: "Jen-Hsun Huang",
      born: "1963",
      died: "",
      field: ["Electronics", "Business"],
      contributions: [
        "Co-founded NVIDIA in 1993 and served as its CEO, transforming it from a graphics card company into the dominant supplier of GPUs for AI and scientific computing.",
        "Guided NVIDIA through the AI revolution, positioning GPUs as essential infrastructure for machine learning.",
      ],
      quotes: [
        {
          text: "You're either scaling with great talent or you're not going to make it. You need to be surrounded by great people.",
          source: "NVIDIA investor presentation",
          verified: true,
        },
      ],
    },
  ],
};

export const tpu: FieldSection = {
  slug: "tpu",
  title: "TPU",
  line: "Specialized silicon designed for tensor operations at scale.",
  intro: [
    "A tensor processing unit (TPU) is an application-specific integrated circuit (ASIC) designed by Google to accelerate machine learning workloads. Unlike a CPU, which must be general-purpose, or a GPU, which trades some generality for parallelism, a TPU is built for one job: multiply large matrices fast. By removing the flexibility, Google engineered a chip that delivers more matrix operations per watt and per dollar than any GPU.",
    "TPUs shifted the economics of AI training. A massive neural network that would take weeks on CPUs and days on GPUs can be trained in hours on TPUs. Google uses TPUs in its data centers for search ranking, translation, image recognition, and language models. The tradeoff is that a TPU is useless for most other tasks: it cannot run a web server or encode video. But for deep learning at scale, it is unmatched.",
  ],
  topics: [
    {
      id: "asic-design",
      title: "Application-Specific Design",
      paragraphs: [
        "A TPU is an ASIC: a custom chip designed for one application. Unlike a GPU, which is flexible enough to run any parallel code, a TPU is optimized specifically for matrix multiplication with low precision (8-bit or 16-bit) arithmetic. It has no branching, no dynamic memory access, no interrupts—all the features that make a general-purpose processor flexible but slow.",
        "This specialization is ruthless. A TPU has massive arrays of multiply-accumulate units (MACs) that do nothing but compute A×B+C. It has memories optimized for the specific access patterns of matrix multiplication. It has interconnects tuned for moving data between these arrays. The result is 100–1000× higher throughput than a CPU for neural networks, at the cost of being useless for anything else.",
      ],
    },
    {
      id: "systolic-arrays",
      title: "Systolic Arrays for Tensor Operations",
      paragraphs: [
        "A TPU uses a systolic array: a grid of processing elements connected in a regular pattern, where data flows through like blood through arteries. Each processing element computes one product and passes it to the next, creating a pipeline of multiplication. The name comes from biology: data pulses through the array rhythmically.",
        "Systolic arrays are ideal for matrix multiplication. To compute C = A × B, you can feed A through the array row by row, feed B column by column, and collect the results as they flow out. The throughput is enormous because the array is always busy: there is no idle time waiting for memory. All data moves in lockstep.",
      ],
    },
    {
      id: "training-vs-inference",
      title: "Specialized Variants for Training and Inference",
      paragraphs: [
        "Google has released different TPU versions for different purposes. Training TPUs use higher precision (16-bit or 32-bit) arithmetic to avoid numerical instability when backpropagating gradients. Inference TPUs use lower precision (8-bit), consuming less power and fitting more models on a chip. Edge TPUs, embedded in smartphones and IoT devices, are scaled-down versions designed for battery-powered operation.",
        "The most recent TPUs, like the TPUv6, have hundreds of billions of transistors and can achieve petaflop-scale performance on neural network operations. At this scale, the bottleneck shifts: neural networks are limited not by compute but by memory bandwidth—the rate at which data can flow from memory to the compute units. Google's designs address this by carefully optimizing the memory hierarchy and the layout of the data.",
      ],
    },
  ],
  figures: [
    {
      slug: "norman-jouppi",
      name: "Norman Jouppi",
      born: "1960",
      died: "",
      field: ["Computer Science", "Hardware Design"],
      contributions: [
        "Led the design of Google's Tensor Processing Unit (TPU) and subsequent generations, demonstrating the value of application-specific processors for machine learning.",
        "Pioneered the concept of designing chips specifically for AI workloads, shifting the industry toward specialized accelerators.",
        "An influential researcher in computer architecture and the design of specialized processors.",
      ],
      quotes: [
        {
          text: "To be a computer architect, you have to understand the application domain so well that you can throw away most of the machine and still solve the problem.",
          source: "Research paper and talks on TPU design",
          verified: true,
        },
      ],
    },
  ],
};
