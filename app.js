/*
Projeto: App de Controle de Investimentos com Gravação Local, Layout Estilizado e Gráficos
Framework: Android Studio + Kotlin + Jetpack Compose + Room + MPAndroidChart
*/

// build.gradle (Module)
dependencies {
    implementation "androidx.room:room-runtime:2.6.1"
    kapt "androidx.room:room-compiler:2.6.1"
    implementation "androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2"
    implementation "androidx.lifecycle:lifecycle-runtime-ktx:2.6.2"
    implementation "androidx.compose.material:material:1.5.0"
    implementation "androidx.compose.ui:ui-tooling-preview:1.5.0"
    implementation "androidx.navigation:navigation-compose:2.7.1"
    implementation 'com.github.PhilJay:MPAndroidChart:v3.1.0'
    kapt "androidx.hilt:hilt-compiler:1.1.0"
}

// ContaEntity.kt
@Entity(tableName = "contas")
data class ContaEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val nome: String,
    val valor: Double,
    val tipo: String // "ativo" ou "passivo"
)

// ContaDao.kt
@Dao
interface ContaDao {
    @Query("SELECT * FROM contas")
    fun getAll(): Flow<List<ContaEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(conta: ContaEntity)

    @Delete
    suspend fun delete(conta: ContaEntity)
}

// AppDatabase.kt
@Database(entities = [ContaEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun contaDao(): ContaDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "conta_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}

// ContaViewModel.kt
class ContaViewModel(private val dao: ContaDao) : ViewModel() {
    val contas: StateFlow<List<ContaEntity>> = dao.getAll().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    fun adicionar(nome: String, valor: Double, tipo: String) {
        viewModelScope.launch {
            dao.insert(ContaEntity(nome = nome, valor = valor, tipo = tipo))
        }
    }

    fun remover(conta: ContaEntity) {
        viewModelScope.launch {
            dao.delete(conta)
        }
    }
}

// ContaViewModelFactory.kt
class ContaViewModelFactory(private val dao: ContaDao) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ContaViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ContaViewModel(dao) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

// MainActivity.kt
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val dao = AppDatabase.getDatabase(applicationContext).contaDao()
        val factory = ContaViewModelFactory(dao)
        val viewModel: ContaViewModel by viewModels { factory }

        setContent {
            MaterialTheme {
                MainScreen(viewModel)
            }
        }
    }
}

// MainScreen.kt
@Composable
fun MainScreen(viewModel: ContaViewModel) {
    val contas by viewModel.contas.collectAsState()
    var nome by remember { mutableStateOf("") }
    var valor by remember { mutableStateOf("") }
    var tipo by remember { mutableStateOf("ativo") }

    val ativos = contas.filter { it.tipo == "ativo" }.sumOf { it.valor }
    val passivos = contas.filter { it.tipo == "passivo" }.sumOf { it.valor }
    val saldoIdeal = ativos * 0.3
    val diferenca = saldoIdeal - passivos

    Column(modifier = Modifier.verticalScroll(rememberScrollState()).padding(16.dp)) {
        Text("Balanço Patrimonial", fontSize = 24.sp, fontWeight = FontWeight.Bold)

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = nome, onValueChange = { nome = it }, label = { Text("Nome") })
            OutlinedTextField(value = valor, onValueChange = { valor = it }, label = { Text("Valor") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
            DropdownMenu(tipo, onSelect = { tipo = it })
            Button(onClick = {
                if (nome.isNotBlank() && valor.toDoubleOrNull() != null) {
                    viewModel.adicionar(nome, valor.toDouble(), tipo)
                    nome = ""
                    valor = ""
                }
            }) {
                Text("Adicionar")
            }
        }

        Spacer(Modifier.height(16.dp))

        Text("Contas Registradas", fontWeight = FontWeight.Bold)
        contas.forEach {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("${it.nome}: R$ ${"%.2f".format(it.valor)} (${it.tipo})", modifier = Modifier.weight(1f))
                Button(onClick = { viewModel.remover(it) }) { Text("Remover") }
            }
        }

        Spacer(Modifier.height(16.dp))
        Text("Resumo", fontWeight = FontWeight.Bold)
        Text("Total de Ativos: R$ %.2f".format(ativos))
        Text("Total de Passivos: R$ %.2f".format(passivos))
        Text("Saldo Ideal (30% dos Ativos): R$ %.2f".format(saldoIdeal))
        Text(if (diferenca > 0) "Comprar até R$ %.2f".format(diferenca) else "Saldo OK")

        Spacer(Modifier.height(16.dp))
        Text("Gráfico de Pizza", fontWeight = FontWeight.Bold)
        AndroidView(factory = { context ->
            PieChart(context).apply {
                data = PieData(PieDataSet(listOf(
                    PieEntry(ativos.toFloat(), "Ativos"),
                    PieEntry(passivos.toFloat(), "Passivos")
                ), "").apply {
                    colors = listOf(ColorTemplate.COLORFUL_COLORS[0], ColorTemplate.COLORFUL_COLORS[1])
                })
                description = Description().apply { text = "" }
                invalidate()
            }
        }, modifier = Modifier.height(300.dp))
    }
}

@Composable
fun DropdownMenu(tipoSelecionado: String, onSelect: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    Box {
        Button(onClick = { expanded = true }) { Text(tipoSelecionado.capitalize()) }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            DropdownMenuItem(onClick = {
                onSelect("ativo"); expanded = false
            }) { Text("Ativo") }
            DropdownMenuItem(onClick = {
                onSelect("passivo"); expanded = false
            }) { Text("Passivo") }
        }
    }
}
